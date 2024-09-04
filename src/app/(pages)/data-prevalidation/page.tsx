'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Select, Form, Table, Button, Checkbox, message, Row, Col, Empty, Dropdown, Alert } from 'antd';
import type { MenuProps, TableProps } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { InfoCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import classes from "@/app/assets/css/pages.module.css";
import { Workspace, FolderData } from '@/app/types/interface';
import { BiDotsVerticalRounded } from "react-icons/bi";
import dynamic from 'next/dynamic';
import { useEmail } from '@/app/context/emailContext';
import { fetchWorkspaces, fetchFolders } from '@/app/API/api';
import axios from 'axios';
import { BaseURL } from '@/app/constants/index';
import { getToken, isBrowser } from '@/utils/auth';
import BreadCrumb from "@/app/components/Breadcrumbs/breadcrumb";

const CustomfillModal = dynamic(() => import('@/app/modals/customfillValueModal/customfillValue'));
const CompositeKeyModal = dynamic(() => import('@/app/modals/composite-keyModal/compositekey'));
const Loader = dynamic(() => import('@/app/loading'), { ssr: false });

interface TableDataType {
    key: string;
    column: string;
    confirmedDataType: string;
    missingOperation: number | React.ReactNode;
    duplicatevalue: string;
    primarykey: boolean;
}

const DataPrevalidation: React.FC = () => {
    const router = useRouter();
    const { id } = useParams();
    const searchParams = useSearchParams();
    const { email } = useEmail();
    const [form] = Form.useForm();
    const workspace = searchParams.get('workspace');
    const folder = searchParams.get('folder');

    const [breadcrumbs, setBreadcrumbs] = useState([{ href: `/create-workspace`, label: `Workspace Management` }]);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [folders, setFolders] = useState<FolderData[]>([]);
    const [tableData, setTableData] = useState<TableDataType[]>([]);
    const [totalRowCount, setTotalRowCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [missingValueOperations, setMissingValueOperations] = useState<{ [column: string]: string }>({});
    const [customFillValues, setCustomFillValues] = useState<{ [column: string]: string }>({});
    const [customFillModalVisible, setCustomFillModalVisible] = useState(false);
    const [customFillValue, setCustomFillValue] = useState('');
    const [currentColumnKey, setCurrentColumnKey] = useState<string>('');
    const [highlightedKeys, setHighlightedKeys] = useState<string[]>([]);
    const [isCompositeKeyModalOpen, setIsCompositeKeyModalOpen] = useState(false);
    const [showInfoText, setShowInfoText] = useState(true);
    const [selectedKeys, setSelectedKeys] = useState<{ [key: string]: boolean }>({});
    const [cleanDataExist, setCleanDataExist] = useState<boolean>(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState<string>(workspace || '');
    const [selectedFolder, setSelectedFolder] = useState<string>(folder || '');

    // Memoized token to prevent recalculating it on every render
    const token = useMemo(() => (isBrowser() ? getToken() : null), []);

    useEffect(() => {
        const initializeData = async () => {
            await loadWorkspaces();
            if (selectedWorkspace) {
                await loadFolders(selectedWorkspace);
            }
            if (selectedFolder) {
                await fetchFolderData(selectedFolder);
            }
        };

        initializeData();
    }, [selectedWorkspace, selectedFolder]);

    const loadWorkspaces = useCallback(async () => {
        if (email) {
            try {
                const workspacesData = await fetchWorkspaces(email, setLoading);
                setWorkspaces(workspacesData);
            } catch (error) {
                console.error("Failed to fetch workspaces.");
                message.error("Failed to fetch workspaces.");
            }
        } else {
            message.error('Email is required to fetch workspaces.');
        }
    }, [email]);

    const loadFolders = useCallback(async (workspaceId: string) => {
        try {
            const fetchedFolders = await fetchFolders(email!, workspaceId, setLoading);
            setFolders(fetchedFolders);
        } catch (error) {
            console.error("Failed to fetch folders.");
            message.error("Failed to fetch folders.");
        }
    }, [email]);

    const fetchFolderData = useCallback(async (folderId: string) => {
        if (!email || !selectedWorkspace || !folderId || !token) return;

        setLoading(true);
        try {
            const response = await axios.get(`${BaseURL}/specific_folder`, {
                params: {
                    userEmail: email,
                    workSpace: selectedWorkspace,
                    folderName: folderId,
                },
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = response.data.data;
            const columns = Object.keys(data.nullRowCount);

            const formattedData = columns.map((col, index) => ({
                key: (index + 1).toString(),
                column: col || 'Unknown',
                confirmedDataType: data.confirmedDataType[col] || 'Text',
                missingOperation: data.nullRowCount[col] || 0,
                duplicatevalue: data.uniqueValuesCount[col] === data.totalRowCount ? 'No' : 'Yes',
                primarykey: data.primarykey.includes(col) || false,
            }));

            setTableData(formattedData);
            setTotalRowCount(data.totalRowCount || 0);
            setCleanDataExist(data.cleanDataExist || false);
        } catch (error) {
            console.error("Error fetching folder data:", error);
            message.error((error as any).response?.data?.error || "Failed to fetch folder data.");
        } finally {
            setLoading(false);
        }
    }, [email, selectedWorkspace, token]);

    const handleChangeWorkspace = (value: string) => {
        setSelectedWorkspace(value);
        setSelectedFolder('');
        setTableData([]);
        setTotalRowCount(0);
        loadFolders(value);
    };

    const handleChangeFolder = (value: string) => {
        setSelectedFolder(value);
        fetchFolderData(value);
    };

    const handleCheckboxChange = useCallback((e: CheckboxChangeEvent, key: string) => {
        const checked = e.target.checked;
        setTableData(prevTableData =>
            prevTableData.map(item => item.key === key ? { ...item, duplicatevalue: checked ? 'Yes' : 'No' } : item)
        );
    }, []);

    const handleMenuClick = (columnKey: string, actionKey: string) => {
        if (actionKey === 'customfill') {
            setCurrentColumnKey(columnKey);
            setCustomFillModalVisible(true);
        } else {
            setMissingValueOperations(prevState => ({
                ...prevState,
                [columnKey]: actionKey,
            }));
        }
    };

    const getMenuItems = (recordKey: string, dataType: string): MenuProps['items'] => {
        const isText = dataType === 'text';
        const isDateTime = ['date', 'time', 'datetime'].includes(dataType);

        return [
            {
                label: <h6 className={classes.dropdownTitle}>Handle Missing Values</h6>,
                key: "title",
                type: "group",
            },
            {
                label: "Forward Fill",
                key: "forwardfill",
                onClick: () => handleMenuClick(recordKey, "forwardfill"),
            },
            {
                label: "Backward Fill",
                key: "backwardfill",
                onClick: () => handleMenuClick(recordKey, "backwardfill"),
            },
            {
                label: "Custom Fill",
                key: "customfill",
                onClick: () => handleMenuClick(recordKey, "customfill"),
            },
            {
                label: "Mean",
                key: "meanfill",
                onClick: () => handleMenuClick(recordKey, "meanfill"),
                disabled: isText || isDateTime,
            },
            {
                label: "Mode",
                key: "modefill",
                onClick: () => handleMenuClick(recordKey, "modefill"),
                disabled: isDateTime,
            },
            {
                label: "Median",
                key: "medianfill",
                onClick: () => handleMenuClick(recordKey, "medianfill"),
                disabled: isText || isDateTime,
            },
            {
                label: "Blank",
                key: "blank",
                onClick: () => handleMenuClick(recordKey, "blank"),
            },
        ];
    };

    const handleDataTypeChange = (value: string, key: string) => {
        setTableData(prevTableData =>
            prevTableData.map(item => item.key === key ? { ...item, confirmedDataType: value } : item)
        );
    };

    const handleCustomFillSave = (customValue: string) => {
        if (currentColumnKey) {
            setCustomFillValues(prevValues => ({
                ...prevValues,
                [currentColumnKey]: customValue,
            }));
            setMissingValueOperations(prevState => ({
                ...prevState,
                [currentColumnKey]: "customfill",
            }));
            setCustomFillModalVisible(false);
            setCustomFillValue('');
        }
    };

    const handlePrimaryKeyAssignment = useCallback((column: string) => {
        setTableData(prevTableData =>
            prevTableData.map(item => ({
                ...item,
                primarykey: item.column === column,
            }))
        );
    }, []);

    const columns: TableProps<TableDataType>['columns'] = useMemo(() => [
        {
            title: 'Column Name',
            dataIndex: 'column',
            key: 'column',
            render: (text, record) => (
                <div className={`${classes.tableBody} ${classes.text}`}>
                    {record.key !== 'fix-composite' && text}
                </div>
            ),
        },
        {
            title: 'Select Data Type',
            dataIndex: 'confirmedDataType',
            key: 'confirmedDataType',
            render: (text, record) => (
                <div className={classes.tableBody}>
                    {record.key !== 'fix-composite' ? (
                        <Select
                            className={classes.selectInput}
                            defaultValue={text}
                            onChange={(value) => handleDataTypeChange(value, record.key)}
                        >
                            <Select.Option value="text">Text</Select.Option>
                            <Select.Option value="number">Number</Select.Option>
                            <Select.Option value="date">Date</Select.Option>
                            <Select.Option value="time">Time</Select.Option>
                            <Select.Option value="datetime">Date-Time</Select.Option>
                        </Select>
                    ) : null}
                </div>
            ),
        },
        {
            title: 'Missing Value Count',
            key: 'missingOperation',
            dataIndex: 'missingOperation',
            render: (text, record) => (
                <div className={`${classes.tableBody} ${highlightedKeys.includes(record.key) ? classes.missingValueHighlight : ''}`}>
                    <div className={classes.valueSelect}>
                        <span>{text}</span>
                        {typeof text === 'number' && text > 0 && (
                            <Dropdown
                                menu={{ items: getMenuItems(record.column, record.confirmedDataType) }}
                                trigger={["click"]}
                            >
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                    }}
                                    className={`${classes.btnBlank} ${classes.btnValueSelect}`}
                                    data-column-key={record.column}
                                >
                                    <BiDotsVerticalRounded />
                                </Button>
                            </Dropdown>
                        )}
                        {missingValueOperations[record.column] && (
                            <span className={classes.displayValue}>{missingValueOperations[record.column]}</span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Duplicate Value Assigned',
            key: 'duplicatevalue',
            dataIndex: 'duplicatevalue',
            render: (text, record) => (
                record.key !== 'fix-composite' ? (
                    <Checkbox
                        checked={text === 'Yes'}
                        onChange={(e) => handleCheckboxChange(e, record.key)}
                    >
                        {text}
                    </Checkbox>
                ) : null
            ),
        },
        {
            title: 'Primary Key',
            key: 'primarykey',
            render: (text, record) => (
                record.key === "fix-composite" ? (
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Button className='btn fontsm' type="primary" onClick={() => setIsCompositeKeyModalOpen(true)}>
                                Assign Composite Key
                            </Button>
                        </Col>
                    </Row>
                ) : (
                    <Button
                        className='btn fontsm'
                        disabled={record.duplicatevalue === 'Yes' || (typeof record.missingOperation === 'number' && record.missingOperation > 0)}
                        onClick={() => handlePrimaryKeyAssignment(record.column)}
                    >
                        {record.primarykey ? 'Primary Key Assigned' : 'Assign Primary Key'}
                    </Button>
                )
            ),
        },
    ], [highlightedKeys, missingValueOperations, handlePrimaryKeyAssignment, handleDataTypeChange, getMenuItems]);

    const tableDataWithFooter: TableDataType[] = useMemo(() => [
        ...tableData,
        {
            key: 'fix-composite',
            column: '',
            confirmedDataType: '',
            missingOperation: '',
            duplicatevalue: '',
            primarykey: false,
        },
    ], [tableData]);

    const rowClassName = (record: TableDataType) => {
        return record.primarykey ? `${classes.primary_key}` : record.key === 'fix-composite' ? classes.footerRow : '';
    };

    const handleSave = async () => {
        const unhandledMissingValues = tableData.filter(row =>
            typeof row.missingOperation === 'number' && row.missingOperation > 0 && !missingValueOperations[row.column]
        );

        if (unhandledMissingValues.length > 0) {
            const unhandledKeys = unhandledMissingValues.map(row => row.key);
            setHighlightedKeys(unhandledKeys);
            message.error("Please select an option to handle missing values for all columns with missing values.");
            return;
        }

        setHighlightedKeys([]);

        const primaryKeys = tableData.filter(row => row.primarykey).map(row => row.column);
        const compositeKeys = Object.keys(selectedKeys).filter(key => selectedKeys[key]);

        if (primaryKeys.length === 0 && compositeKeys.length === 0) {
            message.error('At least one primary key or composite key must be selected.');
            return;
        }

        setLoading(true);

        try {
            const dataType: { [key: string]: string } = {};
            const missingValue: { [key: string]: string } = {};

            tableData.forEach(row => {
                dataType[row.column] = row.confirmedDataType;
            });

            Object.keys(customFillValues).forEach(key => {
                missingValue[key] = customFillValues[key];
            });

            Object.keys(missingValueOperations).forEach(key => {
                missingValue[key] = missingValueOperations[key];
            });

            const requestData = {
                userEmail: email!,
                workSpace: selectedWorkspace,
                folderName: selectedFolder,
                data: {
                    dataType,
                    missingValue,
                    keys: primaryKeys.length > 0 ? primaryKeys : compositeKeys,
                },
            };

            const response = await axios.post(`${BaseURL}/pre_validation`, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                message.success('Data pre-validation completed successfully.');
                router.push('/data-storage');
            } else {
                message.error('Failed to complete data pre-validation.');
            }
        } catch (error) {
            console.error('Error during data pre-validation:', error);
            if (axios.isAxiosError(error)) {
                message.error(error.response?.data?.error || 'Failed to complete data pre-validation.');
            } else {
                message.error('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCompositeKeySave = (selectedColumns: string[]) => {
        setSelectedKeys(selectedColumns.reduce((acc, column) => {
            acc[column] = true;
            return acc;
        }, {} as { [key: string]: boolean }));
        fetchFolderData(selectedFolder);
    };

    return (
        <div className={classes.prevalidation}>
            <div className={classes.bread_crumb_single}>
                <BreadCrumb breadcrumbs={breadcrumbs} />
            </div>
            <div className={classes.heading}>
                <h1>Data Pre-Validation</h1>
            </div>

            <Form layout="vertical" autoComplete="off" scrollToFirstError form={form} id='data-prevalidation-form'>
                <Row gutter={16} className='alinbottom'>
                    <Col lg={6} md={10} sm={24}>
                        <Form.Item name="selectworkspace" label="Select Workspace">
                            <Select
                                size="large"
                                onChange={handleChangeWorkspace}
                                options={workspaces.map(workspace => ({
                                    value: workspace.id,
                                    label: workspace.name
                                }))}
                                id='select-workspace'
                                value={selectedWorkspace}
                            />
                        </Form.Item>
                    </Col>
                    <Col lg={6} md={10} sm={24}>
                        <Form.Item name="selectfolder" label="Select Folder">
                            <Select
                                size="large"
                                onChange={handleChangeFolder}
                                options={folders.map(folder => ({
                                    value: folder.id,
                                    label: folder.name,
                                    disabled: !folder.columnsEstablised,
                                }))}
                                id='select-folder'
                                value={selectedFolder}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            {selectedFolder ? (
                loading ? (
                    <Loader />
                ) : (
                    <>
                        <div className={classes.noteRecord}>
                            <p>Selected Table Records: total {totalRowCount} records found</p>
                        </div>

                        <div className={classes.tableWrapper}>
                            <Form form={form} component={false}>
                                <Table
                                    columns={columns}
                                    dataSource={tableDataWithFooter}
                                    pagination={false}
                                    className="prevalidationTable"
                                    rowClassName={rowClassName}
                                />
                            </Form>
                            <div className={classes.btnWrapper}>
                                <Button type="primary" htmlType="submit" className='btn' onClick={handleSave}>Save</Button>
                            </div>
                        </div>
                    </>
                )
            ) : (
                <div className={classes.noFoldersMessage}>
                    <Empty description="Please select a folder to view table data." />
                </div>
            )}

            {cleanDataExist && (
                <div className={classes.infoContainer}>
                    <Alert
                        type="info"
                        icon={<InfoCircleOutlined className='alert-info' onClick={() => setShowInfoText(!showInfoText)} />}
                        description={showInfoText ? (
                            <div className='alert_info_text'>
                                <span>Note: Pre validations for this folder already exists, and can be observed below.</span>
                                <CloseCircleOutlined onClick={() => setShowInfoText(false)} />
                            </div>
                        ) : null}
                        showIcon
                    />
                </div>
            )}

            <CustomfillModal
                visible={customFillModalVisible}
                onCancel={() => setCustomFillModalVisible(false)}
                onOk={handleCustomFillSave}
                customFillValue={customFillValue}
                setCustomFillValue={setCustomFillValue}
            />

            <CompositeKeyModal
                isModalOpen={isCompositeKeyModalOpen}
                setIsModalOpen={setIsCompositeKeyModalOpen}
                workSpace={selectedWorkspace}
                folderName={selectedFolder}
                onSave={handleCompositeKeySave}
            />
        </div>
    );
};

export default DataPrevalidation;
