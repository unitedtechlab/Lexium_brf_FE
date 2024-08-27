import React from 'react';
import { Row, Col, Select, Input, Form, Button } from 'antd';
import { AiOutlineDelete } from "react-icons/ai";
import classes from '../../workflow.module.css';

interface ConditionRowProps {
    nodeId: number;
    columns: string[];
    handleDeleteConditionNode: (nodeId: number) => void;
}

const ConditionRow: React.FC<ConditionRowProps> = ({
    nodeId,
    columns,
    handleDeleteConditionNode
}) => {
    return (
        <div className={`flex nowrap ${classes.conditionList}`}>
            <Row>
                <Col md={24} sm={24}>
                    <Form.Item
                        name={`column_${nodeId}`}
                        rules={[{ required: true, message: 'Please select a column' }]}
                    >
                        <Select placeholder="Select Column">
                            {columns.map((column) => (
                                <Select.Option key={column} value={column}>
                                    {column}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col md={12} sm={24}>
                    <Form.Item
                        name={`condition_${nodeId}`}
                        rules={[{ required: true, message: 'Please select a condition' }]}
                    >
                        <Select placeholder="Select Condition">
                            <Select.Option value="=">{'='}</Select.Option>
                            <Select.Option value="!=">{'!='}</Select.Option>
                            <Select.Option value=">">{'>'}</Select.Option>
                            <Select.Option value="<">{'<'}</Select.Option>
                            <Select.Option value=">=">{'>='}</Select.Option>
                            <Select.Option value="<=">{'<='}</Select.Option>
                            <Select.Option value="string_match">(For string matching)</Select.Option>
                            <Select.Option value="date_filter">(For date filters)</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col md={12} sm={24}>
                    <Form.Item
                        name={`value_${nodeId}`}
                        rules={[{ required: true, message: 'Please enter a value' }]}
                    >
                        <Input placeholder="Enter Value" />
                    </Form.Item>
                </Col>
            </Row>
            <Button
                type="link"
                danger
                onClick={() => handleDeleteConditionNode(nodeId)}
                className={classes.deleteBtn}
            >
                <AiOutlineDelete />
            </Button>
        </div>
    );
};

export default ConditionRow;
