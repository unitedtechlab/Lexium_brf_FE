import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Select, Button, Form, Row, Col, Tabs, Input, Checkbox, message } from 'antd';
import Classes from '@/app/assets/css/workflow.module.css';
import { BiSearch } from "react-icons/bi";
import { CloseOutlined } from '@ant-design/icons';
import { fetchFolderData } from '@/app/API/api';

interface GroupByProps {
    isModalVisible: boolean;
    handleOk: (values: any) => void;
    handleCancel: () => void;
    setSelectedTable: (value: string | null) => void;
    folders: any[];
    selectedWorkspace: string | null;
    email: string;
    connectedTable: string | null;
}

type GroupByKeys = 'index' | 'value';

const GroupByModal: React.FC<GroupByProps> = ({
    isModalVisible,
    handleOk,
    handleCancel,
    setSelectedTable,
    folders,
    selectedWorkspace,
    email,
    connectedTable
}) => {
    const [form] = Form.useForm();
    const [columns, setColumns] = useState<string[]>([]);
    const [filteredColumns, setFilteredColumns] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [groupbyColumn, setGroupByColumns] = useState<{ index: string[], value: string[] }>({
        index: [],
        value: []
    });
    const [checkedColumns, setCheckedColumns] = useState<Set<string>>(new Set());
    const [functionCheckboxes, setFunctionCheckboxes] = useState<{ [key: string]: string[] }>({});
    const [columnDataTypes, setColumnDataTypes] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (connectedTable && isModalVisible) {
            handleTableChange(connectedTable);
        }
    }, [connectedTable, isModalVisible]);


    const handleTableChange = async (tableId: string) => {
        setSelectedTable(tableId);
        const selectedTable = folders.find(folder => folder.id === tableId);

        if (selectedTable) {
            const columnsObject = selectedTable.columns;
            if (columnsObject && typeof columnsObject === 'object') {
                const columnsArray = Object.values(columnsObject) as string[];
                setColumns(columnsArray);
                setFilteredColumns(columnsArray);

                const confirmedDataTypes = await fetchFolderData(email, selectedWorkspace!, tableId);
                setColumnDataTypes(confirmedDataTypes);
            } else {
                setColumns([]);
                setFilteredColumns([]);
            }
        } else {
            setColumns([]);
            setFilteredColumns([]);
        }
    };

    useEffect(() => {
        if (searchTerm) {
            setFilteredColumns(columns.filter(col => col.toLowerCase().includes(searchTerm.toLowerCase())));
        } else {
            setFilteredColumns(columns);
        }
    }, [searchTerm, columns]);

    const moveColumn = useCallback((column: string, target: GroupByKeys) => {
        setGroupByColumns(prevState => {
            const newIndex = new Set(prevState.index);
            const newValue = new Set(prevState.value);

            if (target === 'index') {
                newIndex.add(column);
                newValue.delete(column);
            } else {
                newValue.add(column);
                newIndex.delete(column);
            }

            return {
                index: Array.from(newIndex),
                value: Array.from(newValue)
            };
        });

        setCheckedColumns(prevChecked => new Set(prevChecked).add(column));
    }, []);

    const removeColumn = (column: string, target: GroupByKeys) => {
        setGroupByColumns(prevState => ({
            ...prevState,
            [target]: prevState[target].filter(item => item !== column),
        }));

        setCheckedColumns(prevChecked => {
            const newChecked = new Set(prevChecked);
            newChecked.delete(column);
            return newChecked;
        });
    };

    const handleDragStart = (event: React.DragEvent<HTMLDivElement>, column: string, source: string) => {
        event.dataTransfer.setData('text/plain', column);
        event.dataTransfer.setData('source', source);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>, target: GroupByKeys) => {
        event.preventDefault();
        const column = event.dataTransfer.getData('text/plain');
        const source = event.dataTransfer.getData('source');

        if (source === target) return;

        if (!groupbyColumn[target].includes(column)) {
            moveColumn(column, target);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleCheckboxChange = (column: string, checked: boolean) => {
        if (checked) {
            if (!groupbyColumn.index.includes(column) && !groupbyColumn.value.includes(column)) {
                moveColumn(column, 'index');
            }
        } else {
            removeColumn(column, 'index');
            removeColumn(column, 'value');
        }
    };

    const handleFunctionCheckboxChange = (column: string, checkedValue: string, checked: boolean) => {
        setFunctionCheckboxes(prevState => ({
            ...prevState,
            [column]: checked
                ? [...(prevState[column] || []), checkedValue]
                : prevState[column].filter(item => item !== checkedValue),
        }));
    };

    const renderDraggableColumn = (column: string) => (
        <div
            key={column}
            draggable
            onDragStart={event => handleDragStart(event, column, 'list')}
            className={Classes.columnItem}
        >
            <Checkbox
                value={column}
                checked={checkedColumns.has(column)}
                onChange={e => handleCheckboxChange(column, e.target.checked)}
                className='checkbox_columns'
            >
                {column}
            </Checkbox>
        </div>
    );

    const renderDroppedColumn = (column: string, target: GroupByKeys) => (
        <div
            key={column}
            draggable
            onDragStart={event => handleDragStart(event, column, target)}
            className={`${Classes.columnItem} ${Classes.droppedItem}`}
        >
            {column}
            <CloseOutlined
                onClick={() => removeColumn(column, target)}
                className={Classes.deleteIcon}
            />
        </div>
    );

    const renderFunctionCheckboxes = (column: string) => {
        const dataType = columnDataTypes[column];
        const isNumberType = dataType === 'number';

        return (
            <div key={column} className={Classes.functionPivot}>
                <h6>{column}</h6>
                <div className={Classes.functionPivotCheckbox}>
                    {isNumberType && (
                        <>
                            <Checkbox
                                value="sum"
                                checked={functionCheckboxes[column]?.includes('sum')}
                                onChange={e => handleFunctionCheckboxChange(column, 'sum', e.target.checked)}
                            >
                                Sum
                            </Checkbox>
                            <Checkbox
                                value="mean"
                                checked={functionCheckboxes[column]?.includes('mean')}
                                onChange={e => handleFunctionCheckboxChange(column, 'mean', e.target.checked)}
                            >
                                Mean
                            </Checkbox>
                            <Checkbox
                                value="std"
                                checked={functionCheckboxes[column]?.includes('std')}
                                onChange={e => handleFunctionCheckboxChange(column, 'std', e.target.checked)}
                            >
                                Std Dev
                            </Checkbox>
                        </>
                    )}
                    <Checkbox
                        value="unique_count"
                        checked={functionCheckboxes[column]?.includes('unique_count')}
                        onChange={e => handleFunctionCheckboxChange(column, 'unique_count', e.target.checked)}
                    >
                        Unique Count
                    </Checkbox>
                    <Checkbox
                        value="count"
                        checked={functionCheckboxes[column]?.includes('count')}
                        onChange={e => handleFunctionCheckboxChange(column, 'count', e.target.checked)}
                    >
                        Count
                    </Checkbox>
                </div>
            </div>
        );
    };

    const items = [
        {
            key: '1',
            label: 'Group By',
            children: (
                <div className={Classes.groupbyArea}>
                    <div
                        className={Classes.dropArea}
                        onDrop={event => handleDrop(event, 'index')}
                        onDragOver={handleDragOver}
                    >
                        <h6>Columns to Group By</h6>
                        <div className={Classes.dropAreaData}>
                            {groupbyColumn.index.map(column => renderDroppedColumn(column, 'index'))}
                        </div>
                    </div>
                    <div
                        className={Classes.dropArea}
                        onDrop={event => handleDrop(event, 'value')}
                        onDragOver={handleDragOver}
                    >
                        <h6>Target Columns</h6>
                        <div className={Classes.dropAreaData}>
                            {groupbyColumn.value.map(column => renderDroppedColumn(column, 'value'))}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: '2',
            label: 'Function',
            children: (
                <>
                    <p><b>Select Function based on Value Column</b></p>
                    <div className={Classes.functionPivotWrapper}>
                        {groupbyColumn.value.length === 0 ? (
                            <p>No Value columns selected</p>
                        ) : (
                            groupbyColumn.value.map(column => renderFunctionCheckboxes(column))
                        )}
                    </div>
                </>
            ),
        },
    ];

    const onOk = () => {
        const hasGroupByColumns = groupbyColumn.index.length > 0;
        const hasFunctionColumns = Object.keys(functionCheckboxes).length > 0 && Object.values(functionCheckboxes).some((arr) => arr.length > 0);

        if (!hasGroupByColumns || !hasFunctionColumns) {
            message.error('Please fill in both Group By and Function sections.');
            return;
        }

        form.validateFields().then((values) => {
            const data = {
                ...values,
                groupbyColumn,
                functionCheckboxes,
            };
            handleOk(data);
            form.resetFields();
            setColumns([]);
            setFilteredColumns([]);
            setGroupByColumns({ index: [], value: [] });
            setCheckedColumns(new Set());
            setFunctionCheckboxes({});
        });
    };

    return (
        <Modal
            title="Group By"
            open={isModalVisible}
            onOk={onOk}
            onCancel={handleCancel}
            width={"100%"}
            centered
            className='modal_maxwidth conditionalmodal'
            footer={[
                <Button key="cancel" onClick={handleCancel} className="btn btn-outline">
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={onOk} className="btn">
                    Save
                </Button>
            ]}
        >
            <Form
                form={form}
                name="folderselect"
                layout="vertical"
            >
                <Row>
                    <Col md={6} sm={24}>
                        <div className={Classes.pivotSidebar}>
                            <Form.Item
                                name="search"
                                label="Select / Drag & Drop the Columns"
                            >
                                <Input
                                    size="large"
                                    prefix={<BiSearch />}
                                    placeholder="Search..."
                                    className={Classes.searchwrapper}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </Form.Item>
                            <div className={Classes.columnList}>
                                {filteredColumns.map(column => renderDraggableColumn(column))}
                            </div>
                        </div>
                    </Col>
                    <Col md={18} sm={24}>
                        <div className={Classes.pivotMain}>
                            <Tabs defaultActiveKey="1" items={items} className='pivot_tabination' />
                        </div>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default GroupByModal;
