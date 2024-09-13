import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Form, Button, Select, message } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { PiFlagCheckered } from "react-icons/pi";
import { MdDeleteOutline } from "react-icons/md";

const VariableNode = ({ id, data, type }: NodeProps<any>) => {
    const [fields, setFields] = useState<any[]>([{ type: 'variable', selectedVariable: '', selectedType: '' }]);
    const folderdata = data.folderdata || {}; 
    const variableEntries = Object.entries(folderdata); 

    const handleSelectChange = (index: number, value: string) => {
        const selectedType = folderdata[value]; 

        const hasTextType = fields.some(field => field.selectedType === 'Text');
        const hasNumberType = fields.some(field => field.selectedType === 'number');
        if ((hasTextType && selectedType !== 'Text') || (hasNumberType && selectedType !== 'number')) {
            message.warning('Cannot select a variable with a different type.');
            return;
        }

        setFields((prevFields) => {
            const newFields = [...prevFields];
            newFields[index].selectedVariable = value;
            newFields[index].selectedType = selectedType;
            return newFields;
        });

        data[`variable${index + 1}`] = value;
    };

    const addVariableField = () => {
        setFields((prevFields) => [...prevFields, { type: 'variable', selectedVariable: '', selectedType: '' }]);
    };

    const handleDelete = (index: number) => {
        setFields((prevFields) => prevFields.filter((_, i) => i !== index));
        delete data[`variable${index + 1}`];
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
                                </div>
                            </div>
                            <Button onClick={addVariableField}>
                                Add Variable
                            </Button>
                        </div>
                        <div className={`flex gap-1 ${styles.formInput}`}>
                            {fields.map((field, index) => (
                                <Form.Item
                                    key={index}
                                    label={`Field ${index + 1}`}
                                    className={`nodrag ${styles.widthInput} ${styles.fullwidth} customselect`}
                                >
                                    {fields[index].selectedType && (
                                        <div className={styles.message}>
                                            {fields[index].selectedType === 'Text' ? 'Type: Text' : 'Type: Number'}
                                        </div>
                                    )}
                                    <Select
                                        showSearch
                                        placeholder="Select Variable"
                                        value={field.selectedVariable}
                                        onChange={(value) => handleSelectChange(index, value)}
                                        className={`nodrag ${styles.inputField}`}
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option?.children
                                                ? option.children.toString().toLowerCase().includes(input.toLowerCase())
                                                : false
                                        }
                                    >
                                        {variableEntries.map(([key, type]) => (
                                            <Select.Option key={key} value={key}>
                                                {key} 
                                            </Select.Option>
                                        ))}
                                    </Select>

                                    {index !== 0 && (
                                        <button className={styles.deleteBtn} onClick={() => handleDelete(index)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>
                                            <MdDeleteOutline />
                                        </button>
                                    )}
                                </Form.Item>
                            ))}
                        </div>
                        <Handle type="source" position={Position.Right} />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default VariableNode;
