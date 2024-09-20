import React, { useState, useMemo, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Form, Button, Select } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { PiFlagCheckered } from "react-icons/pi";
import { MdDeleteOutline } from "react-icons/md";
import { FiPlus } from "react-icons/fi";

const VariableNode: React.FC<NodeProps<any>> = ({ id, data, type }) => {
    const [fields, setFields] = useState<any[]>([{ type: 'variable', selectedVariable: '' }]);
    const [availableColumns, setAvailableColumns] = useState<string[]>([]);

    // Effect to load available columns from data passed into the node
    useEffect(() => {
        if (data && data.folderdata) {
            const columns = Object.keys(data.folderdata || {}).filter((key) => {
                const columnType = data.folderdata[key]?.toLowerCase();
                return ['number', 'int', 'float'].includes(columnType);
            });
            setAvailableColumns(columns);
        }
    }, [data]);

    // Memo to track selected variables to disable already selected ones in the dropdown
    const selectedVariables = useMemo(() => {
        return fields.map((field) => field.selectedVariable);
    }, [fields]);

    const areAllFieldsSelected = useMemo(() => {
        return fields.every(field => field.selectedVariable !== '');
    }, [fields]);

    const handleSelectChange = (index: number, value: string) => {
        setFields((prevFields) => {
            const newFields = [...prevFields];
            newFields[index].selectedVariable = value;

            if (index === 0) {
                data['variableType'] = data.folderdata[value];
            }

            return newFields;
        });

        data[`variable${index + 1}`] = value;
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

        if (index === 0) {
            delete data['variableType'];
        }
    };

    return (
        <div>
            <div className={styles['nodeBox']} style={{ maxWidth: "300px" }}>
                <Form name="custom-value" layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <PiFlagCheckered className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || "Addition / Subtraction"}</h6>
                                    {fields[0].selectedVariable && <span>Type: {data.variableType}</span>}
                                </div>
                            </div>
                            <Button onClick={addVariableField} disabled={!areAllFieldsSelected} className={styles.addBtn}>
                                <FiPlus />
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
                                        {availableColumns.map((column: string) => (
                                            <Select.Option
                                                key={column}
                                                value={column}
                                                disabled={selectedVariables.includes(column)}
                                            >
                                                {column}
                                            </Select.Option>
                                        ))}
                                    </Select>

                                    {index !== 0 && (
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDelete(index)}
                                            style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                                        >
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
