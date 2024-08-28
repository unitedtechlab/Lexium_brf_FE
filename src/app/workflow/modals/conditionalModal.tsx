import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Form, Row, Col, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import classes from '../workflow.module.css';
import ConditionRow from '../components/ConditionNode/conditionBox';
import SubConditionRow from '../components/ConditionNode/subConditionalBox';
import { fetchFolders, fetchFolderData } from '@/app/API/api';
import { RxDragHandleDots2 } from "react-icons/rx";

interface ConditionalProps {
    isModalVisible: boolean;
    handleOkay: (values: any) => void;
    handleCancel: () => void;
    setSelectedTable: (value: string | null) => void;
    workspaces: any[];
    folders: any[];
    selectedWorkspace: string | null;
    email: string;
    initialValues?: any;
}

interface ConditionField {
    id: number;
    type: string;
    conditions: ConditionField[];
    outsideConditions: ConditionField[];
    operator?: string;
    selectedDataType?: string; // Track selected data type
}

const ConditionalModal: React.FC<ConditionalProps> = ({
    isModalVisible,
    handleOkay,
    handleCancel,
    setSelectedTable,
    folders,
    selectedWorkspace,
    email,
    initialValues
}) => {
    const [form] = Form.useForm();
    const [columns, setColumns] = useState<{ key: string, name: string }[]>([]);
    const [columnDataTypes, setColumnDataTypes] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [conditionType, setConditionType] = useState<string>('');
    const [conditionNodes, setConditionNodes] = useState<ConditionField[]>([
        { id: Date.now(), type: 'if', conditions: [], outsideConditions: [], selectedDataType: 'text' }
    ]);

    // Fetch and set columns and data types when a table is selected
    const handleTableChange = async (value: string) => {
        setSelectedTable(value);
        setIsLoading(true);

        try {
            const folders = await fetchFolders(email, selectedWorkspace!, setIsLoading);
            const selectedFolder = folders.find(folder => folder.id === value);
            if (selectedFolder) {
                const columnsArray = selectedFolder.columns
                    ? Object.entries(selectedFolder.columns).map(([key, name]) => ({ key, name }))
                    : [];
                setColumns(columnsArray);

                // Fetch and set column data types
                const confirmedDataTypes = await fetchFolderData(email, selectedWorkspace!, value);
                setColumnDataTypes(confirmedDataTypes);
            }
        } catch (error) {
            message.error('Failed to fetch columns.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle condition type change (if, if/else, else/if)
    const handleConditionTypeChange = (value: string) => {
        setConditionType(value);

        let newConditionNodes: ConditionField[] = [];

        if (value === 'if') {
            newConditionNodes = [{ id: Date.now(), type: 'if', conditions: [], outsideConditions: [], selectedDataType: 'text' }];
        } else if (value === 'if/else') {
            newConditionNodes = [
                { id: Date.now(), type: 'if', conditions: [], outsideConditions: [], selectedDataType: 'text' },
                { id: Date.now() + 1, type: 'else', conditions: [], outsideConditions: [], selectedDataType: 'text' }
            ];
        } else if (value === 'else/if') {
            newConditionNodes = [
                { id: Date.now(), type: 'if', conditions: [], outsideConditions: [], selectedDataType: 'text' },
                { id: Date.now() + 1, type: 'else if', conditions: [], outsideConditions: [], selectedDataType: 'text' },
                { id: Date.now() + 2, type: 'else', conditions: [], outsideConditions: [], selectedDataType: 'text' }
            ];
        }

        setConditionNodes(newConditionNodes);
    };

    const renderOperators = (dataType: string | undefined): JSX.Element => {
        if (!dataType) return <></>;

        switch (dataType) {
            case 'number':
                return (
                    <>
                        <Select.Option value="=">{'='}</Select.Option>
                        <Select.Option value="!=">{'!='}</Select.Option>
                        <Select.Option value=">">{'>'}</Select.Option>
                        <Select.Option value="<">{'<'}</Select.Option>
                        <Select.Option value=">=">{'>='}</Select.Option>
                        <Select.Option value="<=">{'<='}</Select.Option>
                    </>
                );
            case 'date':
                return (
                    <>
                        <Select.Option value="=">{'='}</Select.Option>
                        <Select.Option value="!=">{'!='}</Select.Option>
                        <Select.Option value=">">{'>'}</Select.Option>
                        <Select.Option value="<">{'<'}</Select.Option>
                        <Select.Option value=">=">{'>='}</Select.Option>
                        <Select.Option value="<=">{'<='}</Select.Option>
                    </>
                );
            case 'text':
                return (
                    <>
                        <Select.Option value="=">{'='}</Select.Option>
                        <Select.Option value="!=">{'!='}</Select.Option>
                        <Select.Option value="string_match">String Match</Select.Option>
                    </>
                );
            default:
                return (
                    <>
                        <Select.Option value="=">{'='}</Select.Option>
                        <Select.Option value="!=">{'!='}</Select.Option>
                        <Select.Option value="string_match">String Match</Select.Option>
                    </>
                );
        }
    };

    const handleColumnChange = (nodeId: number, columnName: string, isOutsideCondition: boolean = false, conditionId?: number) => {
        const dataType = columnDataTypes[columnName];
        setConditionNodes(prevNodes =>
            prevNodes.map(node => {
                if (node.id === nodeId) {
                    if (isOutsideCondition && conditionId !== undefined) {
                        return {
                            ...node,
                            outsideConditions: node.outsideConditions.map(oc =>
                                oc.id === conditionId ? { ...oc, selectedDataType: dataType } : oc
                            ),
                        };
                    } else {
                        return { ...node, selectedDataType: dataType };
                    }
                }
                return node;
            })
        );
    };

    const onOk = () => {
        form.validateFields().then((values) => {
            const conditions = conditionNodes.map(node => ({
                type: node.type,
                column: values[`column_${node.id}`],
                condition: values[`condition_${node.id}`],
                value: values[`value_${node.id}`],
                subConditions: node.conditions.map(subNode => ({
                    operator: values[`suboperator_${node.id}_${subNode.id}`],
                    column: values[`subcolumn_${node.id}_${subNode.id}`],
                    condition: values[`subcondition_${node.id}_${subNode.id}`],
                    value: values[`subvalue_${node.id}_${subNode.id}`],
                })),
                outsideConditions: node.outsideConditions.map(outsideNode => ({
                    operator: values[`outsideOperator_${node.id}_${outsideNode.id}`],
                    column: values[`outsideColumn_${node.id}_${outsideNode.id}`],
                    condition: values[`outsideCondition_${node.id}_${outsideNode.id}`],
                    value: values[`outsideValue_${node.id}_${outsideNode.id}`],
                }))
            }));

            const modalValues = {
                ...values,
                conditionType,
                conditions
            };

            handleOkay(modalValues);
            form.resetFields();
            handleCancel();
        });
    };

    const handleDeleteCondition = (nodeId: number, conditionId: number, isOutsideCondition: boolean = false) => {
        setConditionNodes(
            conditionNodes.map(node =>
                node.id === nodeId
                    ? isOutsideCondition
                        ? { ...node, outsideConditions: node.outsideConditions.filter(condition => condition.id !== conditionId) }
                        : { ...node, conditions: node.conditions.filter(condition => condition.id !== conditionId) }
                    : node
            )
        );
    };

    const addOutsideCondition = (nodeId: number) => {
        setConditionNodes(
            conditionNodes.map(node =>
                node.id === nodeId
                    ? {
                        ...node,
                        outsideConditions: [
                            ...node.outsideConditions,
                            {
                                id: Date.now(),
                                type: 'outsideCondition',
                                conditions: [],
                                outsideConditions: [],
                                selectedDataType: 'text',
                            }
                        ]
                    }
                    : node
            )
        );
    };

    const addInsideCondition = (nodeId: number) => {
        setConditionNodes(
            conditionNodes.map(node =>
                node.id === nodeId
                    ? {
                        ...node,
                        conditions: [
                            ...node.conditions,
                            {
                                id: Date.now(),
                                type: 'subCondition',
                                conditions: [],
                                outsideConditions: [],
                                selectedDataType: 'text', // Initialize with a default value
                            }
                        ]
                    }
                    : node
            )
        );
    };

    const addElseIfCondition = (nodeId: number) => {
        const elseNodeIndex = conditionNodes.findIndex(node => node.type === 'else');
        const newElseIfNode: ConditionField = {
            id: Date.now(),
            type: 'else if',
            conditions: [],
            outsideConditions: [],
            selectedDataType: 'text', // Initialize with a default value
        };

        setConditionNodes(prevNodes => {
            const updatedNodes = [...prevNodes];
            if (elseNodeIndex !== -1) {
                updatedNodes.splice(elseNodeIndex, 0, newElseIfNode);
            } else {
                updatedNodes.push(newElseIfNode);
            }
            return updatedNodes;
        });
    };

    const handleDeleteConditionNode = (nodeId: number) => {
        if (conditionNodes.length > 1) {
            setConditionNodes(conditionNodes.filter(node => node.id !== nodeId));
        }
    };

    return (
        <Modal
            title="Conditional Operator"
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
                name="conditionalForm"
                layout="vertical"
                initialValues={initialValues}
            >
                <div className="padding-16">
                    <Row gutter={16}>
                        <Col md={12} sm={24}>
                            <Form.Item
                                name="table"
                                label="Select Table"
                                rules={[{ required: true, message: 'Please select a table' }]}
                            >
                                <Select
                                    placeholder="Select Table"
                                    disabled={!selectedWorkspace}
                                    onChange={handleTableChange}
                                >
                                    {folders
                                        .filter(folder => folder.workspaceId === selectedWorkspace)
                                        .map((folder) => (
                                            <Select.Option key={folder.id} value={folder.id}>
                                                {folder.name}
                                            </Select.Option>
                                        ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col md={12} sm={24}>
                            <Form.Item
                                name="conditionType"
                                label="Condition Type"
                                rules={[{ required: true, message: 'Please select a condition type' }]}
                            >
                                <Select placeholder="Select Condition Type" onChange={handleConditionTypeChange}>
                                    <Select.Option value="if">If</Select.Option>
                                    <Select.Option value="if/else">If Else</Select.Option>
                                    <Select.Option value="else/if">Else If</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {conditionType && (
                        <>
                            <Row gutter={16} className='margin_zero'>
                                {conditionNodes.map((node) => (
                                    <React.Fragment key={node.id}>
                                        <Col md={8} sm={24}>
                                            <div className={classes.checkLabel}>
                                                <label>{node.type === 'if' ? 'If' : node.type === 'else if' ? 'Else If' : 'Else'}</label>
                                                {node.type === 'else if' && (
                                                    <Button
                                                        icon={<PlusOutlined />}
                                                        onClick={() => addElseIfCondition(node.id)}
                                                        className={classes.btnAdd}
                                                    >
                                                        Add New Else If
                                                    </Button>
                                                )}
                                            </div>

                                            <div className={classes.conditionNode}>
                                                <div className={`operationCondition`}>
                                                    <Row>
                                                        {node.type !== 'else' ? (
                                                            <>
                                                                <Col md={1} sm={24}>
                                                                    <div className={classes.selectIF}>
                                                                        <RxDragHandleDots2 />
                                                                    </div>
                                                                </Col>
                                                                <Col md={23} sm={24}>
                                                                    <ConditionRow
                                                                        nodeId={node.id}
                                                                        columns={columns.map(col => col.name)}
                                                                        handleDeleteConditionNode={handleDeleteConditionNode}
                                                                        renderOperators={() => renderOperators(node.selectedDataType || 'text')} // Use node's selected data type
                                                                        columnDataTypes={columnDataTypes}
                                                                        handleColumnChange={(nodeId, columnName) => handleColumnChange(nodeId, columnName)}
                                                                    />

                                                                    {node.conditions.length > 0 && (
                                                                        <div className={classes.conditionList}>
                                                                            {node.conditions.map((condition) => (
                                                                                <SubConditionRow
                                                                                    key={condition.id}
                                                                                    nodeId={node.id}
                                                                                    conditionId={condition.id}
                                                                                    columns={columns.map(col => col.name)}
                                                                                    handleDeleteCondition={handleDeleteCondition}
                                                                                    renderOperators={(dataType) => renderOperators(dataType || 'text')} // Pass down the correct data type
                                                                                    columnDataTypes={columnDataTypes}
                                                                                    handleColumnChange={(nodeId, columnName) => handleColumnChange(nodeId, columnName)}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {node.type !== 'else' && (
                                                                        <div className={classes.conditionBtn}>
                                                                            <Button
                                                                                type="dashed"
                                                                                icon={<PlusOutlined />}
                                                                                onClick={() => addInsideCondition(node.id)}
                                                                            >
                                                                                Add Conditions
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </Col>
                                                            </>
                                                        ) : (
                                                            <Col md={24} sm={24}>
                                                                <div className={classes.elseCondition}>
                                                                    <p>Any conditions that are not met by the 'If' statement will be handled by the 'Else' pathway.</p>
                                                                </div>
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </div>
                                            </div>

                                            {node.outsideConditions.length > 0 && (
                                                <>
                                                    {node.outsideConditions.map((outsideCondition) => (
                                                        <div className={`${classes.outsideCondition}`} key={outsideCondition.id}>
                                                            <SubConditionRow
                                                                key={outsideCondition.id}
                                                                nodeId={node.id}
                                                                conditionId={outsideCondition.id}
                                                                columns={columns.map(col => col.name)}
                                                                isOutsideCondition={true}
                                                                handleDeleteCondition={(nodeId, conditionId) => handleDeleteCondition(nodeId, conditionId, true)}
                                                                renderOperators={(dataType) => renderOperators(dataType || 'text')} // Use outside condition's selected data type with fallback
                                                                columnDataTypes={columnDataTypes}
                                                                handleColumnChange={(nodeId, columnName) => handleColumnChange(nodeId, columnName, true, outsideCondition.id)} // Pass handleColumnChange to update operator based on column
                                                            />
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                            {node.type !== 'else' && (
                                                <div className={classes.conditionBtn}>
                                                    <Button
                                                        type="dashed"
                                                        icon={<PlusOutlined />}
                                                        onClick={() => addOutsideCondition(node.id)}
                                                    >
                                                        Add And / or Conditions
                                                    </Button>
                                                </div>
                                            )}
                                        </Col>
                                    </React.Fragment>
                                ))}
                            </Row>
                        </>
                    )}
                </div>
            </Form>
        </Modal>
    );
};

export default ConditionalModal;
