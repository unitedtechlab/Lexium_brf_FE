import React, { useState, useMemo, useEffect } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from 'reactflow';
import { Form, Button, Select, Dropdown, message } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { MdDeleteOutline, MdOutlineSelectAll } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { BsThreeDots } from "react-icons/bs";
import SaveGlobalVariableModal from '../modals/GlobalVariableModal';
import { usePathname } from 'next/navigation';

const getConnectedNode = (nodeId: string, allEdges: any[], allNodes: any[]) => {
    const connectedEdges = allEdges.filter(edge => edge.source === nodeId);

    if (connectedEdges.length === 0) {
        return nodeId;
    }

    const targetNodeId = connectedEdges[0].target;
    return getConnectedNode(targetNodeId, allEdges, allNodes);
};

const VariableNode: React.FC<NodeProps<any>> = ({ id, data, type }) => {
    const { getEdges, getNodes, setNodes } = useReactFlow();
    const [fields, setFields] = useState<any[]>([{ type: 'variable', selectedVariable: '' }]);
    const [availableColumns, setAvailableColumns] = useState<string[]>([]);
    const [variableType, setVariableType] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const pathname = usePathname();


    useEffect(() => {
        if (data && data.folderdata) {
            const columns = Object.keys(data.folderdata || {}).filter((key) => {
                const columnType = data.folderdata[key]?.toLowerCase();
                return ['number', 'int', 'float'].includes(columnType);
            });
            setAvailableColumns(columns);
        }

        if (!data.variables) {
            data.variables = [];
        }
    }, [data]);

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

            if (index === 0 || !variableType) {
                const selectedType = data.folderdata[value];
                data['variableType'] = selectedType;
                setVariableType(selectedType);
            }

            if (newFields.length === 1) {
                data.variables = value;
            } else {
                data.variables = newFields.map((field) => field.selectedVariable);
            }

            return newFields;
        });
    };

    const addVariableField = () => {
        if (areAllFieldsSelected) {
            setFields((prevFields) => [
                ...prevFields,
                { type: 'variable', selectedVariable: '' }
            ]);
        }
    };

    const handleDelete = (index: number) => {
        if (fields.length === 1) return;

        setFields((prevFields) => {
            const updatedFields = prevFields.filter((_, i) => i !== index);

            if (updatedFields.length === 1) {
                data.variables = updatedFields[0].selectedVariable;
            } else {
                data.variables = updatedFields.map((field) => field.selectedVariable);
            }

            return updatedFields;
        });
    };

    const handleDeleteNode = () => {
        setNodes((nds) => nds.filter(node => node.id !== id));
        message.success('Node deleted successfully');
    };

    const openGlobalVariableModal = () => {
        setIsModalVisible(true);
    };

    const handleSaveAsGlobalVariable = (globalVariableName: string) => {
        if (!data.variables || !data.variables.length) {
            message.error("No variables to save.");
            return;
        }

        const allEdges = getEdges();
        const allNodes = getNodes();
        const lastConnectedNodeId = getConnectedNode(id, allEdges, allNodes);

        const globalVariables = JSON.parse(localStorage.getItem('GlobalVariables') || '[]');
        const newGlobalVariable = {
            GlobalVariableName: globalVariableName,
            type: 'variables',
            nodeID: lastConnectedNodeId,
            value: data.variables,
            variableType: data.variableType || null,
        };

        globalVariables.push(newGlobalVariable);
        localStorage.setItem('GlobalVariables', JSON.stringify(globalVariables));

        message.success('Variables saved as global variable.');
        window.dispatchEvent(new Event('globalVariableUpdated'));
        setIsModalVisible(false);
    };

    const menuItems = [
        {
            label: 'Delete Node',
            key: '0',
            onClick: handleDeleteNode
        },
        {
            label: 'Save as a Global variable',
            key: '1',
            onClick: openGlobalVariableModal
        }
    ];

    return (
        <div>
            <div className={`${styles['nodeBox']} ${styles.variblenode}`} style={{ maxWidth: "300px" }}>
                <Form name={`variables-form-${id}`} layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <MdOutlineSelectAll className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || "Addition / Subtraction"}</h6>
                                    {variableType && <span>Type: {variableType}</span>}
                                </div>
                            </div>
                            <div className='flex gap-1'>
                                {pathname !== '/conditional' && (
                                    <Button onClick={addVariableField} disabled={!areAllFieldsSelected} className={styles.addBtn}>
                                        <FiPlus />
                                    </Button>
                                )}
                                <Dropdown
                                    menu={{ items: menuItems }}
                                    trigger={['click']}
                                >
                                    <a onClick={(e) => e.preventDefault()} className='iconFont'>
                                        <BsThreeDots />
                                    </a>
                                </Dropdown>
                            </div>
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

                                    {fields.length > 1 && (
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

                <SaveGlobalVariableModal
                    visible={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    onSave={handleSaveAsGlobalVariable}
                />
            </div>
        </div>
    );
};

export default VariableNode;
