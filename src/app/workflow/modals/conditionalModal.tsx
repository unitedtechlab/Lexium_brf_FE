import React, { useState } from 'react';
import { Modal, Select, Button, Form, Row, Col, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import classes from '../workflow.module.css';
import ConditionRow from '../components/ConditionNode/conditionBox';
import SubConditionRow from '../components/ConditionNode/subConditionalBox';
import { fetchFolders } from '@/app/API/api';
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
    const [columns, setColumns] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [conditionType, setConditionType] = useState<string>('');
    const [conditionNodes, setConditionNodes] = useState<ConditionField[]>([
        { id: Date.now(), type: 'if', conditions: [], outsideConditions: [] }
    ]);

    const handleTableChange = async (value: string) => {
        setSelectedTable(value);
        setIsLoading(true);

        try {
            const folders = await fetchFolders(email, selectedWorkspace!, setIsLoading);
            const selectedFolder = folders.find(folder => folder.id === value);
            if (selectedFolder) {
                const columns = selectedFolder.columns ? Object.values(selectedFolder.columns) : [];
                setColumns(columns);
            }
        } catch (error) {
            message.error('Failed to fetch columns.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConditionTypeChange = (value: string) => {
        setConditionType(value);

        let newConditionNodes: ConditionField[] = [];

        if (value === 'if') {
            newConditionNodes = [{ id: Date.now(), type: 'if', conditions: [], outsideConditions: [] }];
        } else if (value === 'if/else') {
            newConditionNodes = [
                { id: Date.now(), type: 'if', conditions: [], outsideConditions: [] },
                { id: Date.now() + 1, type: 'else', conditions: [], outsideConditions: [] }
            ];
        } else if (value === 'else/if') {
            newConditionNodes = [
                { id: Date.now(), type: 'if', conditions: [], outsideConditions: [] },
                { id: Date.now() + 1, type: 'else if', conditions: [], outsideConditions: [] },
                { id: Date.now() + 2, type: 'else', conditions: [], outsideConditions: [] }
            ];
        }

        setConditionNodes(newConditionNodes);
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
                                outsideConditions: []
                            }
                        ]
                    }
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
                                outsideConditions: []
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
            outsideConditions: []
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
                name="filterForm"
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
                                {conditionNodes.map((node, index) => (
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
                                                                        columns={columns}
                                                                        handleDeleteConditionNode={handleDeleteConditionNode}
                                                                    />

                                                                    {node.conditions.length > 0 && (
                                                                        <div className={classes.conditionList}>
                                                                            {node.conditions.map((condition, idx) => (
                                                                                <SubConditionRow
                                                                                    key={condition.id}
                                                                                    nodeId={node.id}
                                                                                    conditionId={condition.id}
                                                                                    columns={columns}
                                                                                    handleDeleteCondition={handleDeleteCondition}
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
                                                                columns={columns}
                                                                isOutsideCondition={true} // Pass the outside condition flag
                                                                handleDeleteCondition={(nodeId, conditionId) => handleDeleteCondition(nodeId, conditionId, true)}
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
