'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button, message } from 'antd';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { BaseURL } from "@/app/constants/index";
import { useEmail } from "@/app/context/emailContext";
import BreadCrumb from "@/app/components/Breadcrumbs/breadcrumb";
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Xarrow, { Xwrapper } from 'react-xarrows';
import classes from './column.module.css';
import Image from 'next/image';
import layoutImage from '../../assets/images/layout.png';
import tableImage from '../../assets/images/table.png';
import Loader from '@/app/loading';
import { getToken } from '@/utils/auth';

interface ColumnData {
    slNo: string;
    columnName: string;
}

interface DraggableColumnProps {
    column: ColumnData;
    index: number;
    moveColumn: (fromIndex: number, toIndex: number) => void;
    onSelectColumn: (columnId: string, isExisting: boolean) => void;
}

interface DragItem {
    index: number;
    type: string;
}

const ItemType = 'COLUMN';

const DraggableColumn: React.FC<DraggableColumnProps> = React.memo(({ column, index, moveColumn, onSelectColumn }) => {
    const ref = useRef<HTMLLIElement>(null);

    const [, drop] = useDrop<DragItem>({
        accept: ItemType,
        hover(item: DragItem) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;

            moveColumn(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [, drag] = useDrag({
        type: ItemType,
        item: { type: ItemType, index },
    });

    drag(drop(ref));

    return (
        <li
            ref={ref}
            className={classes.draggableItem}
            id={`newColumn-${index}`}
            onClick={() => onSelectColumn(`newColumn-${index}`, false)}
        >
            {column.columnName}
        </li>
    );
});

const CustomArrow: React.FC<{ start: string; end: string; color: string; strokeWidth: number; onClick: () => void }> = ({ start, end, color, strokeWidth, onClick }) => {
    return (
        <div className='custom-arrow' onClick={onClick} style={{ position: 'relative', cursor: 'pointer' }}>
            <Xarrow start={start} end={end} color={color} strokeWidth={strokeWidth} />
        </div>
    );
};

const ColumnEstablishmentPage: React.FC = () => {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const workspace = searchParams.get('workspace');
    const folder = searchParams.get('folder');
    const file = searchParams.get('file');
    const { email } = useEmail();
    const router = useRouter();
    const token = getToken();

    const [firstFileColumns, setFirstFileColumns] = useState<ColumnData[]>([]);
    const [currentFileColumns, setCurrentFileColumns] = useState<ColumnData[]>([]);
    const [breadcrumbs, setBreadcrumbs] = useState<{ href: string; label: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [firstFileName, setFirstFileName] = useState<string>('');
    const [establishedFileName, setEstablishedFileName] = useState<string>(file || '');
    const [selectedExistingColumn, setSelectedExistingColumn] = useState<string | null>(null);
    const [relations, setRelations] = useState<{ start: string; end: string }[]>([]);

    const fetchFileColumns = useCallback(async (fileName: string) => {
        setIsLoading(true);
        const params = {
            userEmail: email,
            workSpace: workspace,
            folderName: folder,
            fileName,
        };

        try {
            const response = await axios.get(`${BaseURL}/get_file_columns`, {
                params,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 200 && response.data) {
                const columnNames = response.data.data.columnNames;
                return Object.keys(columnNames).map(key => ({
                    slNo: key,
                    columnName: columnNames[key],
                }));
            } else {
                message.error("Failed to fetch columns from the server.");
                return [];
            }
        } catch (error) {
            console.error("Error fetching column names:", error);
            message.error("Failed to fetch columns due to an error.");
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [email, workspace, folder, token]);

    const fetchFolderColumns = useCallback(async () => {
        if (!workspace || !folder) return;
        setIsLoading(true);
        const params = { userEmail: email, workSpace: workspace };

        try {
            const response = await axios.get(`${BaseURL}/folder`, {
                params,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 200 && response.data) {
                const folderData = response.data.data[folder];
                if (folderData && Object.keys(folderData.columns).length > 0) {
                    const columns = folderData.columns;
                    const firstColumns = Object.keys(columns).map(key => ({
                        slNo: key,
                        columnName: columns[key],
                    }));
                    setFirstFileColumns(firstColumns);
                    setFirstFileName(folder);
                } else {
                    message.error("No established columns found for the folder.");
                }
            } else {
                message.error("Failed to fetch folder columns from the server.");
            }
        } catch (error) {
            console.error("Error fetching folder columns:", error);
            message.error("Failed to fetch folder columns due to an error.");
        } finally {
            setIsLoading(false);
        }
    }, [workspace, folder, email, token]);

    useEffect(() => {
        if (workspace && folder && file) {
            setBreadcrumbs([
                { href: `/create-workspace`, label: `${workspace.replace(/-/g, ' ')} Workspace` },
                { href: `/create-folder/${id}`, label: `${folder.replace(/-/g, ' ')} Folder` },
                { href: `/importdata/${id}?workspace=${workspace}&folder=${folder}&filename=${file}`, label: `${file}` }
            ]);
        }
    }, [workspace, folder, file, id]);

    useEffect(() => {
        fetchFolderColumns();
        if (file) {
            fetchFileColumns(file).then(columns => {
                setCurrentFileColumns(columns);
            });
        }
    }, [file, fetchFolderColumns, fetchFileColumns]);

    useEffect(() => {
        const initialRelations = firstFileColumns.flatMap(firstColumn => {
            const matchIndex = currentFileColumns.findIndex(
                currentColumn => currentColumn.columnName === firstColumn.columnName
            );
            if (matchIndex !== -1) {
                return [{ start: `existingColumn-${firstColumn.slNo}`, end: `newColumn-${matchIndex}` }];
            }
            return [];
        });
        setRelations(initialRelations);
    }, [firstFileColumns, currentFileColumns]);

    const handleSave = async () => {
        const updatedColumns = currentFileColumns.map(column => {
            const relation = relations.find(r => r.end === `newColumn-${currentFileColumns.indexOf(column)}`);
            if (relation) {
                const firstColumn = firstFileColumns.find(fc => `existingColumn-${fc.slNo}` === relation.start);
                if (firstColumn) {
                    return { ...column, columnName: firstColumn.columnName };
                }
            }
            return column;
        });

        const columnsData = updatedColumns.reduce((acc: { [key: string]: string }, item) => {
            acc[item.slNo] = item.columnName;
            return acc;
        }, {});

        try {
            setIsLoading(true);
            await axios.post(`${BaseURL}/establish_file_columns`, {
                userEmail: email,
                workSpace: workspace,
                folderName: folder,
                fileName: file,
                data: columnsData,
            }, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });

            message.success("Columns established successfully.");
            router.push(`/importdata/${workspace}?workspace=${workspace}&folder=${folder}`);
        } catch (error) {
            console.error("Error establishing columns:", error);
            message.error("Failed to establish columns.");
        } finally {
            setIsLoading(false);
        }
    };

    const moveColumn = useCallback((fromIndex: number, toIndex: number) => {
        setCurrentFileColumns(prevColumns => {
            const updatedColumns = [...prevColumns];
            const [movedColumn] = updatedColumns.splice(fromIndex, 1);
            updatedColumns.splice(toIndex, 0, movedColumn);
            return updatedColumns;
        });
    }, []);

    const handleSelectColumn = useCallback((columnId: string, isExisting: boolean) => {
        if (isExisting) {
            setSelectedExistingColumn(columnId);
        } else {
            if (selectedExistingColumn) {
                setRelations(prev => [
                    ...prev.filter(relation => relation.start !== selectedExistingColumn && relation.end !== columnId),
                    { start: selectedExistingColumn, end: columnId }
                ]);
                setSelectedExistingColumn(null);
            }
        }
    }, [selectedExistingColumn]);

    const handleRemoveLine = useCallback((startId: string, endId: string) => {
        setRelations(prev => prev.filter(relation => !(relation.start === startId && relation.end === endId)));
    }, []);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={classes.establishmentPage}>
                <div className={`${classes.dataHeader} flex justify-space-between align-center`}>
                    <div className={classes.headName}>
                        <h5>Column Establishment</h5>
                        <div className={classes.breadcrumbWrapper}>
                            <BreadCrumb breadcrumbs={breadcrumbs} />
                        </div>
                    </div>
                    <div className={`${classes.headBtn} flex align-center gap-1`}>
                        <Button className='btn btn-outline' onClick={() => router.back()}>
                            Discard
                        </Button>
                        <Button className='btn' onClick={handleSave} disabled={isLoading}>
                            Save
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <Loader />
                ) : (
                    <Xwrapper>
                        <div className={classes.columnsComparison}>
                            <div className={classes.tableWrapper}>
                                <div className={classes.table}>
                                    <div className={`${classes.filename} flex`}>
                                        <Image src={tableImage} alt='File Name' width={40} height={40} />
                                        <p>{firstFileName} <span>Established Folder</span></p>
                                    </div>
                                    <ul>
                                        {firstFileColumns.map((column) => (
                                            <div key={column.slNo} id={`existingColumn-${column.slNo}`} onClick={() => handleSelectColumn(`existingColumn-${column.slNo}`, true)}>
                                                <li className={classes.existingColumn}>
                                                    {column.columnName}
                                                </li>
                                            </div>
                                        ))}
                                    </ul>
                                </div>
                                <div className={classes.table}>
                                    <div className={`${classes.filename} flex`}>
                                        <Image src={layoutImage} alt='File Name' width={40} height={40} />
                                        <p>{establishedFileName} <span>Establish File</span></p>
                                    </div>
                                    <ul>
                                        {currentFileColumns.map((column, index) => (
                                            <div key={column.slNo} id={`newColumn-${index}`} onClick={() => handleSelectColumn(`newColumn-${index}`, false)}>
                                                <DraggableColumn
                                                    column={column}
                                                    index={index}
                                                    moveColumn={moveColumn}
                                                    onSelectColumn={handleSelectColumn}
                                                />
                                            </div>
                                        ))}
                                    </ul>
                                    {relations.map((relation, index) => (
                                        <CustomArrow
                                            key={index}
                                            start={relation.start}
                                            end={relation.end}
                                            color="#341539"
                                            strokeWidth={1.5}
                                            onClick={() => handleRemoveLine(relation.start, relation.end)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Xwrapper>
                )}
            </div>
        </DndProvider>
    );
};

export default ColumnEstablishmentPage;
