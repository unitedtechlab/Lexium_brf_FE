import React, { useState, useEffect } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Form, Input, Select } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { PiFlagCheckered } from "react-icons/pi";
import { usePathname } from 'next/navigation';
const { Option } = Select;

const ConstantNode = ({ id, data, type }: NodeProps<any>) => {
    const [inputValue, setInputValue] = useState<string>('');
    const [valueType, setValueType] = useState<string | null>(null);
    const [selectedCondition, setselectedCondition] = useState<string | null>(null);
    const [selectedGate, setSelectedGate] = useState<string | null>(null);
    const pathname = usePathname();

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

    const determineValueType = (value: string) => {
        // ============== Dont Remove this commnet as need to resuse it later.
        // if (value.includes('.')) {
        //     return 'float';
        // } else if (value !== '') {
        //     return 'int';
        // } else {
        //     return null;
        // }

        if (value !== '') {
            return 'number';
        } else {
            return null;
        }
    };

    const handleGateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (/^-?\d*\.?\d*$/.test(value)) {
            setInputValue(value);
            const valueType = determineValueType(value);
            setValueType(valueType);

            data.value = value;
            data.variableType = valueType;
        }
    };

    useEffect(() => {
        if (data.value) {
            setInputValue(data.value);
            setValueType(data.variableType || determineValueType(data.value));
        }
    }, [data.value, data.variableType]);

    return (
        <div>
            <div className={styles['nodeBox']} style={{ maxWidth: "250px" }}>
                <Form name="custom-value" layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <PiFlagCheckered className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || "Addition / Subtraction"}</h6>
                                    {valueType && (
                                        <span>Type: {valueType}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={`flex gap-1 ${styles.formInput}`}>
                        {pathname === '/arithmetic' && ( <Form.Item
                                className={`nodrag ${styles.widthInput} ${styles.fullwidth} customselect`}
                            >
                                <Input
                                    className={`nodrag ${styles.inputField}`}
                                    placeholder="Enter Constant value"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                />
                            </Form.Item>
                        )}
                            {pathname === '/conditional' && (
                                <Form.Item className={`nodrag ${styles.widthInput} ${styles.fullwidth} customselect`}>
                                    <Input
                                        className={`nodrag ${styles.inputField}`}
                                        placeholder="Enter Constant value"
                                        value={inputValue}
                                        onChange={handleGateInputChange}
                                    />
                                    <Select
                                        className={`nodrag ${styles.inputField}`}
                                        placeholder="Select Option"
                                        value={selectedGate}
                                        onChange={(value) => handleSelectChange(value, 'option')}
                                    >
                                        <Option value="greater-than"> &gt; </Option>
                                        <Option value="less-than"> 	&lt; </Option>
                                        <Option value="greater-than-equalto"> =&gt;</Option>
                                        <Option value="less-than-equalto"> 	&lt;= </Option>
                                        <Option value="equalto">=</Option>
                                    </Select>
                                </Form.Item>
                            )}
                        </div>
                        <Handle type="source" position={Position.Right} />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ConstantNode;
