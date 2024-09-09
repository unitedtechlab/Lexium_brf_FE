import React, { useState } from 'react';
import { Row, Col, Select, Input, Form, Button, Radio } from 'antd';
import { AiOutlineDelete } from "react-icons/ai";
import classes from '@/app/assets/css/workflow.module.css';

interface SubConditionRowProps {
    nodeId: number;
    conditionId: number;
    columns: string[];
    handleDeleteCondition: (nodeId: number, conditionId: number, isOutsideCondition?: boolean) => void;
    renderOperators: (dataType: string | undefined) => JSX.Element;
    columnDataTypes: { [key: string]: string };
    handleColumnChange: (nodeId: number, columnName: string) => void;
    isOutsideCondition?: boolean;
}

const SubConditionRow: React.FC<SubConditionRowProps> = ({
    nodeId,
    conditionId,
    columns,
    handleDeleteCondition,
    renderOperators,
    columnDataTypes,
    handleColumnChange,
    isOutsideCondition = false
}) => {
    const [selectedDataType, setSelectedDataType] = useState<string>('text');

    const onColumnChange = (value: string) => {
        const dataType = columnDataTypes[value] || 'text';
        setSelectedDataType(dataType);
        handleColumnChange(nodeId, value);
    };

    return (
        <div className={classes.RadioRepeatedBlock}>
            <Form.Item
                name={isOutsideCondition ? `outsideOperator_${nodeId}_${conditionId}` : `suboperator_${nodeId}_${conditionId}`}
                initialValue="and"
                noStyle
            >
                <Radio.Group buttonStyle="solid" className='radiogroup'>
                    <Radio.Button value="and">And</Radio.Button>
                    <Radio.Button value="or">Or</Radio.Button>
                </Radio.Group>
            </Form.Item>
            <div className={`${classes.addDelete} nowrap`}>
                <Row>
                    <Col md={24} sm={24}>
                        <Form.Item
                            name={isOutsideCondition ? `outsideColumn_${nodeId}_${conditionId}` : `subcolumn_${nodeId}_${conditionId}`}
                            rules={[{ required: true, message: 'Please select a column' }]}
                        >
                            <Select
                                placeholder="Select Column"
                                onChange={onColumnChange}
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
                            name={isOutsideCondition ? `outsideCondition_${nodeId}_${conditionId}` : `subcondition_${nodeId}_${conditionId}`}
                            rules={[{ required: true, message: 'Please select a condition' }]}
                        >
                            <Select placeholder="Select Condition">
                                {renderOperators(selectedDataType)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col md={12} sm={24}>
                        <Form.Item
                            name={isOutsideCondition ? `outsideValue_${nodeId}_${conditionId}` : `subvalue_${nodeId}_${conditionId}`}
                            rules={[{ required: true, message: 'Please enter a value' }]}
                        >
                            <Input placeholder="Enter Value" />
                        </Form.Item>
                    </Col>
                </Row>
                <Button
                    onClick={() => handleDeleteCondition(nodeId, conditionId, isOutsideCondition)}
                    className={classes.deleteBtn}
                >
                    <AiOutlineDelete />
                </Button>
            </div>
        </div>
    );
};

export default SubConditionRow;
