import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Row, Col, Tabs, Input, Checkbox, message } from 'antd';
import Classes from '@/app/assets/css/workflow.module.css';
import { BiSearch } from "react-icons/bi";
import { CloseOutlined } from '@ant-design/icons';
import { fetchFolderData } from '@/app/API/api';

interface PivotTableProps {
    isModalVisible: boolean;
    handleOk: (values: any) => void;
    handleCancel: () => void;
    setSelectedTable: (value: string | null) => void;
    folders: any[];
    selectedWorkspace: string | null;
    email: string;
    connectedTable: string | null;
}

const PivotTableModal: React.FC<PivotTableProps> = ({
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
    const [pivotColumns, setPivotColumns] = useState<{ [key: string]: string[] }>({
        index: [],
        column: [],
        value: []
    });
    const [checkedColumns, setCheckedColumns] = useState<string[]>([]);
    const [functionCheckboxes, setFunctionCheckboxes] = useState<{ [key: string]: string[] }>({});
    const [columnDataTypes, setColumnDataTypes] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (isModalVisible && connectedTable) {
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

    const moveColumn = useCallback((column: string, target: string) => {
        setPivotColumns(prevState => ({
            ...prevState,
            index: prevState.index.filter(col => col !== column),
            column: prevState.column.filter(col => col !== column),
            value: prevState.value.filter(col => col !== column),
            [target]: [...prevState[target], column]
        }));

        setCheckedColumns(prevChecked => Array.from(new Set([...prevChecked, column])));

        if (target === 'value') {
            setFunctionCheckboxes(prev => ({
                ...prev,
                [column]: []
            }));
        }
    }, []);

    const removeColumn = (column: string, target: string) => {
        setPivotColumns(prevState => ({
            ...prevState,
            [target]: prevState[target].filter(item => item !== column)
        }));

        setCheckedColumns(prevChecked => prevChecked.filter(item => item !== column));

        if (target === 'value') {
            setFunctionCheckboxes(prev => {
                const updated = { ...prev };
                delete updated[column];
                return updated;
            });
        }
    };

    const handleDragStart = (event: React.DragEvent<HTMLDivElement>, column: string, source: string) => {
        event.dataTransfer.setData('text/plain', column);
        event.dataTransfer.setData('source', source);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>, target: string) => {
        const column = event.dataTransfer.getData('text/plain');
        const source = event.dataTransfer.getData('source');

        if (source !== target) {
            moveColumn(column, target);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleCheckboxChange = (column: string, checked: boolean) => {
        if (checked) {
            moveColumn(column, 'index');
        } else {
            setPivotColumns(prevState => ({
                index: prevState.index.filter(item => item !== column),
                column: prevState.column.filter(item => item !== column),
                value: prevState.value.filter(item => item !== column)
            }));
            setCheckedColumns(prevChecked => prevChecked.filter(item => item !== column));
        }
    };

    const handleFunctionCheckboxChange = (column: string, checkedValue: string, checked: boolean) => {
        setFunctionCheckboxes(prevState => ({
            ...prevState,
            [column]: checked
                ? [...prevState[column], checkedValue]
                : prevState[column].filter(item => item !== checkedValue)
        }));
    };

    const renderDraggableColumn = (column: string, source: string) => (
        <div
            key={column}
            draggable
            onDragStart={event => handleDragStart(event, column, source)}
            className={Classes.columnItem}
        >
            <Checkbox
                value={column}
                checked={checkedColumns.includes(column)}
                onChange={e => handleCheckboxChange(column, e.target.checked)}
                className='checkbox_columns'
            >
                {column}
            </Checkbox>
        </div>
    );

    const renderDroppedColumn = (column: string, target: string) => (
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
                                Std
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
            label: 'Pivot',
            children: (
                <div className={Classes.pivotArea}>
                    <div
                        className={Classes.dropArea}
                        onDrop={event => handleDrop(event, 'index')}
                        onDragOver={handleDragOver}
                    >
                        <h6>Index</h6>
                        <div className={Classes.dropAreaData}>
                            {pivotColumns.index.map(column => renderDroppedColumn(column, 'index'))}
                        </div>
                    </div>
                    <div
                        className={Classes.dropArea}
                        onDrop={event => handleDrop(event, 'column')}
                        onDragOver={handleDragOver}
                    >
                        <h6>Column</h6>
                        <div className={Classes.dropAreaData}>
                            {pivotColumns.column.map(column => renderDroppedColumn(column, 'column'))}
                        </div>
                    </div>
                    <div
                        className={Classes.dropArea}
                        onDrop={event => handleDrop(event, 'value')}
                        onDragOver={handleDragOver}
                    >
                        <h6>Value</h6>
                        <div className={Classes.dropAreaData}>
                            {pivotColumns.value.map(column => renderDroppedColumn(column, 'value'))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: '2',
            label: 'Function',
            children: (
                <>
                    <p><b>Select Function based on Value Pivot Column</b></p>
                    <div className={Classes.functionPivotWrapper}>
                        {pivotColumns.value.length === 0 ? (
                            <p>No Value columns selected</p>
                        ) : (
                            pivotColumns.value.map(column => renderFunctionCheckboxes(column))
                        )}
                    </div>
                </>
            )
        }
    ];

    const onOk = () => {
        const hasPivotColumns = Object.values(pivotColumns).some(columns => columns.length > 0);
        const hasFunctionForValues = pivotColumns.value.every(valueColumn => functionCheckboxes[valueColumn]?.length > 0);

        if (!hasPivotColumns) {
            message.error('Please select at least one column in the Pivot tab.');
            return;
        }

        if (!hasFunctionForValues) {
            message.error('Please select at least one function for each Value column in the Function tab.');
            return;
        }

        form.validateFields()
            .then(values => {
                const data = {
                    ...values,
                    pivotColumns,
                    functionCheckboxes
                };
                handleOk(data);
                form.resetFields();
                setColumns([]);
                setFilteredColumns([]);
                setPivotColumns({ index: [], column: [], value: [] });
                setCheckedColumns([]);
                setFunctionCheckboxes({});
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title="Pivot Table"
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
                                {filteredColumns.map(column => renderDraggableColumn(column, 'list'))}
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

export default PivotTableModal;
