import React, { useState } from 'react';
import styles from '@/app/assets/css/workflow.module.css';
import { Form, Input, Select } from 'antd';
import { MdOutlineSelectAll } from 'react-icons/md';
import { Handle, NodeProps, Position } from 'reactflow';
const { Option } = Select;

const ConditionalPage = ({ id, data, type }: NodeProps<any>) => {
    const [selectedCondition, setselectedCondition] = useState<string | null>(null);
    const [selectedGate, setSelectedGate] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState<string>("");

    const handleSelectChange = (value: string, type: 'condition' | 'option') => {
        if (type === 'condition') {
            setselectedCondition(value);
        } else if (type === 'option') {
            setSelectedGate(value);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    return (
        <div className={styles.diamondStyle}>
            <div className={styles.labelStyle}>
                <Form name="conditional-node" layout="horizontal" className={styles.formStyle}>
                    <div>
                        <div>
                            <div>
                                <MdOutlineSelectAll className={styles.iconFlag} />
                                <div>
                                    <h6>{data.label || "Conditional Operator"}</h6>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Form.Item >
                                <Select
                                    className={`nodrag ${styles.inputField}`}
                                    placeholder="Select Condition"
                                    onChange={(value) => handleSelectChange(value, 'condition')}
                                    value={selectedCondition}
                                >
                                    <Option value="if">If</Option>
                                    <Option value="if/else">If Else</Option>
                                </Select>
                            </Form.Item>
                        </div>
                        <Handle type="target" position={Position.Top} style={{ background: '#00796b', top: "-51px" }} />
                        <Handle type="source" position={Position.Right} style={{ background: '#00796b', right: "-42px" }} />
                        <Handle type="source" position={Position.Bottom} style={{ background: '#00796b', bottom: "-54px" }} />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ConditionalPage;
