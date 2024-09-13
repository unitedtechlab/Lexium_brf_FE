import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Form, Button, Input } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { PiFlagCheckered } from "react-icons/pi";

const VariableNode = ({ id, data, type }: NodeProps<any>) => {
    const [inputValue, setInputValue] = useState<string>('');
    const [valueType, setValueType] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Reuse this code later for set type of input value (Don't Remove)
        // if (/^-?\d*\.?\d*$/.test(value)) {
        //     setInputValue(value);
        //     if (value.includes('.')) {
        //         setValueType('float');
        //     } else if (value !== '') {
        //         setValueType('int');
        //     } else {
        //         setValueType(null);
        //     }
        // }

        if (/^-?\d*\.?\d*$/.test(value)) {
            setInputValue(value);

            if (value !== '') {
                setValueType('number');
            } else {
                setValueType(null);
            }
        }
    };

    return (
        <div>
            <div className={styles['nodeBox']} style={{ maxWidth: "370px" }}>
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
                            <Form.Item
                                className={`nodrag ${styles.widthInput} ${styles.fullwidth} customselect`}
                            >
                                <Input
                                    className={`nodrag ${styles.inputField}`}
                                    placeholder="Enter Constant value"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                />
                            </Form.Item>
                        </div>
                        <Handle type="source" position={Position.Right} />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default VariableNode;
