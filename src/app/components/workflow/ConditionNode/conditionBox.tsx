import React from 'react';
import { Row, Col, Select, Input, Form, Button } from 'antd';
import { AiOutlineDelete } from "react-icons/ai";
import classes from '@/app/assets/css/workflow.module.css';

interface ConditionRowProps {
    nodeId: number;
    columns: string[];
    handleDeleteConditionNode: (nodeId: number) => void;
    renderOperators: (dataType: string | undefined) => JSX.Element;
    columnDataTypes: { [key: string]: string };
    handleColumnChange: (nodeId: number, columnName: string) => void;
}

const ConditionRow: React.FC<ConditionRowProps> = ({
    nodeId,
    columns,
    handleDeleteConditionNode,
    renderOperators,
    columnDataTypes,
    handleColumnChange
}) => {
    const [selectedColumn, setSelectedColumn] = React.useState<string | undefined>(undefined);

    const handleColumnSelection = (value: string) => {
        setSelectedColumn(value);
        handleColumnChange(nodeId, value);
    };

    return (
        <div className={`flex nowrap ${classes.conditionList}`}>
            <Row>
                <Col md={24} sm={24}>
                    <Form.Item
                        name={`column_${nodeId}`}
                        rules={[{ required: true, message: 'Please select a column' }]}
                    >
                        <Select
                            placeholder="Select Column"
                            onChange={handleColumnSelection}
                        >
                            {columns.map((column, index) => (
                                <Select.Option key={`${column}_${index}`} value={column}>
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
                            {renderOperators(selectedColumn ? columnDataTypes[selectedColumn] : 'text')}
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
