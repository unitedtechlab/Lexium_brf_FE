import React from 'react';
import { Row, Col, Select, Input, Form, Button, Radio } from 'antd';
import { AiOutlineDelete } from "react-icons/ai";
import classes from '../../workflow.module.css';

interface SubConditionRowProps {
    nodeId: number;
    conditionId: number;
    columns: string[];
    handleDeleteCondition: (nodeId: number, conditionId: number, isOutsideCondition?: boolean) => void;
    isOutsideCondition?: boolean;
}

const SubConditionRow: React.FC<SubConditionRowProps> = ({
    nodeId,
    conditionId,
    columns,
    handleDeleteCondition,
    isOutsideCondition = false
}) => {
    return (
        <div className={classes.RadioRepeatedBlock}>
            <Form.Item
                name={isOutsideCondition ? `outsideOperator_${nodeId}_${conditionId}` : `suboperator_${nodeId}_${conditionId}`}
                initialValue="and"
                noStyle
            >
                <Radio.Group
                    buttonStyle="solid"
                    className='radiogroup'
                >
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
                            name={isOutsideCondition ? `outsideCondition_${nodeId}_${conditionId}` : `subcondition_${nodeId}_${conditionId}`}
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
