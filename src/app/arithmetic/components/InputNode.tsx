import React, { useState, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Form, Button, Select } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { PiFlagCheckered } from "react-icons/pi";
import { MdDeleteOutline } from "react-icons/md";

const VariableNode = ({ id, data, type }: NodeProps<any>) => {
    const [fields, setFields] = useState<any[]>([{ type: 'variable', selectedVariable: '', selectedType: '' }]);
    const { columns = {} } = data;

    const selectedVariables = useMemo(() => {
        return fields.map(field => field.selectedVariable);
    }, [fields]);

    const areAllFieldsSelected = useMemo(() => {
        return fields.every(field => field.selectedVariable !== '');
    }, [fields]);

    const getFilteredColumns = (selectedType?: string) => {
        return Object.keys(columns).filter((column) => {
            const columnType = columns[column]?.toLowerCase();
            return ['number', 'int', 'float'].includes(columnType) && (!selectedType || columnType === selectedType);
        });
    };

    const handleSelectChange = (index: number, value: string) => {
        setFields((prevFields) => {
            const newFields = [...prevFields];
            newFields[index].selectedVariable = value;
            newFields[index].selectedType = columns[value] || '';
            return newFields;
        });

        data[`variable${index + 1}`] = value;
        data[`variableType${index + 1}`] = columns[value] || '';
    };

    const addVariableField = () => {
        if (areAllFieldsSelected) {
            const firstSelectedType = fields[0]?.selectedType;
            setFields((prevFields) => [
                ...prevFields,
                { type: 'variable', selectedVariable: '', selectedType: firstSelectedType }
            ]);
        }
    };

    const handleDelete = (index: number) => {
        setFields((prevFields) => prevFields.filter((_, i) => i !== index));
        delete data[`variable${index + 1}`];
        delete data[`variableType${index + 1}`];
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
                                    {fields[0].selectedType && <span>Type: {fields[0].selectedType}</span>}
                                </div>
                            </div>
                            <Button onClick={addVariableField} disabled={!areAllFieldsSelected}>
                                Add Variable
                            </Button>
                        </div>
                        <div className={`flex gap-1 ${styles.formInput}`}>
                            {fields.map((field, index) => (
                                <Form.Item
                                    key={index}
                                    className={`nodrag ${styles.widthInput} ${styles.fullwidth} customselect`}
                                >
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
                                        {index === 0 ? (
                                            getFilteredColumns().map((column: string) => (
                                                <Select.Option key={column} value={column} disabled={selectedVariables.includes(column)}>
                                                    {column}
                                                </Select.Option>
                                            ))
                                        ) : (
                                            getFilteredColumns(fields[0].selectedType).map((column: string) => (
                                                <Select.Option key={column} value={column} disabled={selectedVariables.includes(column)}>
                                                    {column}
                                                </Select.Option>
                                            ))
                                        )}
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
