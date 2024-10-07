import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Form, Row, Col, message, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import classes from '@/app/assets/css/workflow.module.css';

interface ArithmeticModalProps {
    isModalVisible: boolean;
    handleOkay: (values: any) => void;
    handleCancel: () => void;
    setSelectedTable: (value: string | null) => void;
    folders: any[];
    connectedTable: string | null;
}

const operationSymbols: { [key: string]: string } = {
    Addition: '+',
    Subtraction: '-',
    Multiplication: '*',
    Division: '/',
    Modulus: '%',
    Exponential: '^',
    Absolute: '|x|',
};

const ArithmeticModal: React.FC<ArithmeticModalProps> = ({
    isModalVisible,
    handleOkay,
    handleCancel,
    setSelectedTable,
    folders,
    connectedTable,
}) => {
    const [form] = Form.useForm();
    const [columns, setColumns] = useState<string[]>([]);
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [enteredValue, setEnteredValue] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [droppedItems, setDroppedItems] = useState<{ id: string, content: string }[]>([]);

    useEffect(() => {
        if (connectedTable) {
            handleTableChange(connectedTable);
        }
    }, [connectedTable]);

    const handleTableChange = async (tableId: string) => {
        setSelectedTable(tableId);
        setIsLoading(true);

        try {
            const selectedFolder = folders.find(folder => folder.id === tableId);
            if (selectedFolder) {
                const columns = (selectedFolder.columns ? Object.values(selectedFolder.columns) : []) as string[];
                setColumns(columns);
            }
        } catch (error) {
            message.error('Failed to fetch columns.');
        } finally {
            setIsLoading(false);
        }
    };


    const handleColumnChange = (values: string[]) => {
        setSelectedColumns(values);
        const newDroppedItems = values
            .filter(value => !droppedItems.find(item => item.content === value))
            .map(value => ({ id: `${droppedItems.length}-${value}`, content: value }));

        setDroppedItems([...droppedItems, ...newDroppedItems]);
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEnteredValue(e.target.value);
    };

    const onDragStart = (item: string, index?: number) => {
        setDraggedItem(item);
        if (index !== undefined) setDraggedIndex(index);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (draggedItem) {
            const content = operationSymbols[draggedItem] || draggedItem;
            if (draggedIndex !== null) {
                const updatedItems = [...droppedItems];
                updatedItems.splice(draggedIndex, 1);
                updatedItems.push({ id: `${droppedItems.length}-${draggedItem}`, content });
                setDroppedItems(updatedItems);
            } else {
                setDroppedItems([...droppedItems, { id: `${droppedItems.length}-${draggedItem}`, content }]);
            }
            setDraggedItem(null);
            setDraggedIndex(null);
        }
    };

    const handleDeleteItem = (id: string) => {
        setDroppedItems(droppedItems.filter(item => item.id !== id));
    };

    const onOk = () => {
        form.validateFields()
            .then(values => {
                const sourceColumns = droppedItems
                    .filter(item => columns.includes(item.content))
                    .map(item => item.content);

                handleOkay({
                    ...values,
                    sourceColumn: sourceColumns,
                    operation: droppedItems.map(item => item.content).join(' '),
                });
                form.resetFields();
                setDroppedItems([]);
                setSelectedColumns([]);
                setEnteredValue('');
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title="Arithmetic Operation"
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
                </Button>,
            ]}
        >
            <Form
                form={form}
                name="arithmeticForm"
                layout="vertical"
            >
                <Row>
                    <Col md={6} sm={24}>
                        <div className={classes.pivotSidebar}>
                            <Form.Item
                                name="sourceColumns"
                                label="Select Columns"
                                rules={[{ required: true, message: 'Please select at least one source column' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select Source Columns"
                                    onChange={handleColumnChange}
                                    value={selectedColumns}
                                >
                                    {columns.map((column) => (
                                        <Select.Option key={column} value={column}>
                                            {column}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="targetvalue"
                                label="Enter Value"
                            >
                                <Input
                                    placeholder="Enter Value"
                                    value={enteredValue}
                                    onChange={handleValueChange}
                                    onFocus={() => setDraggedItem(null)}
                                    type='number'
                                />
                                {enteredValue && (
                                    <h6
                                        className={classes.enteredValue}
                                        draggable
                                        onDragStart={() => onDragStart(enteredValue)}
                                    >
                                        {enteredValue}
                                    </h6>
                                )}
                            </Form.Item>

                            <Form.Item
                                name="operation"
                                label="Arithmetic Operations"
                            >
                                <div className={classes.operationsBoxs}>
                                    {Object.keys(operationSymbols).map((operation) => (
                                        <div
                                            key={operation}
                                            draggable
                                            className={classes.operationValue}
                                            onDragStart={() => onDragStart(operation)}
                                        >
                                            {operation}
                                        </div>
                                    ))}
                                </div>
                            </Form.Item>

                            <Form.Item
                                name="Brackets"
                                label="Brackets"
                            >
                                <div className={classes.operationsBoxs}>
                                    <div
                                        draggable
                                        onDragStart={() => onDragStart("(")}
                                        className={classes.operationValue}
                                        title='Open Bracket'
                                    >
                                        (
                                    </div>
                                    <div
                                        draggable
                                        onDragStart={() => onDragStart(")")}
                                        className={classes.operationValue}
                                        title='Close Bracket'
                                    >
                                        )
                                    </div>
                                </div>
                            </Form.Item>
                        </div>
                    </Col>
                    <Col md={18} sm={24}>
                        <div
                            className={classes.arithmeticWrapper}
                            onDrop={onDrop}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            {droppedItems.length > 0 ? (
                                droppedItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={classes.droppedItem}
                                        draggable
                                        onDragStart={() => onDragStart(item.content, index)}
                                    >
                                        {item.content}
                                        <CloseOutlined onClick={() => handleDeleteItem(item.id)} className={classes.closeButton} />
                                    </div>
                                ))
                            ) : (
                                <div className={classes.emptyDropZone}>
                                    Drop columns, operations, or brackets here
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ArithmeticModal;
