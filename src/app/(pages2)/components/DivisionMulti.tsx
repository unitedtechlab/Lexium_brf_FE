import React, { useState, useEffect } from 'react';
import { NodeProps, useReactFlow, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { message, Dropdown } from 'antd';
import { PiMathOperationsBold } from "react-icons/pi";
import { BsThreeDots } from "react-icons/bs";
import SaveGlobalVariableModal from '../modals/GlobalVariableModal';
import CustomHandle from './CustomHandle';

// Define the type for connected values
type ConnectedValues = {
    multiplyValues: string[],
    divideValues: string[],
};

const MultiplyDivide = ({ id, data }: NodeProps<any>) => {
    const { getEdges, getNode, setNodes } = useReactFlow();
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Explicitly type connectedValues
    const [connectedValues, setConnectedValues] = useState<ConnectedValues>({
        multiplyValues: [],
        divideValues: [],
    });

    // Update connectedValues based on current edges
    useEffect(() => {
        const updateConnectedValues = () => {
            const edges = getEdges().filter((edge) => edge.target === id);

            const multiplyValues: string[] = [];
            const divideValues: string[] = [];

            edges.forEach((edge) => {
                const sourceNode = getNode(edge.source);
                if (sourceNode) {
                    // If connected to target1 (multiply), add to multiplyValues
                    if (edge.targetHandle === 'target1') {
                        multiplyValues.push(sourceNode.id);
                    }
                    // If connected to target2 (divide), add to divideValues
                    if (edge.targetHandle === 'target2') {
                        divideValues.push(sourceNode.id);
                    }
                }
            });

            setConnectedValues({ multiplyValues, divideValues });

            // Update the node in ReactFlow
            setNodes((nodes) =>
                nodes.map((node) =>
                    node.id === id
                        ? {
                            ...node,
                            data: {
                                ...node.data,
                                multiplyValues,
                                divideValues,
                            },
                        }
                        : node
                )
            );
        };

        // Call on component mount to ensure initial connection values are set
        updateConnectedValues();

        // Listen for real-time changes in edges
        const edges = getEdges();
        if (edges.length > 0) {
            updateConnectedValues(); // Trigger whenever an edge changes
        }
    }, [getEdges, getNode, id, setNodes]);

    const handleDeleteNode = () => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        message.success('Node deleted successfully');
    };

    const openGlobalVariableModal = () => {
        setIsModalVisible(true);
    };

    const handleSaveAsGlobalVariable = (globalVariableName: string) => {
        const globalVariables = JSON.parse(localStorage.getItem('GlobalVariables') || '[]');
        const newGlobalVariable = {
            GlobalVariableName: globalVariableName,
            nodeID: id,
            type: 'multiply_divide_type',
            multiplyValues: connectedValues.multiplyValues,
            divideValues: connectedValues.divideValues,
            variableType: data.variableType || 'unknown',
        };

        globalVariables.push(newGlobalVariable);
        localStorage.setItem('GlobalVariables', JSON.stringify(globalVariables));

        message.success('Node saved as a global variable.');
        window.dispatchEvent(new Event('globalVariableUpdated'));
        setIsModalVisible(false);
    };

    const menuItems = [
        {
            label: 'Delete Node',
            key: '0',
            onClick: handleDeleteNode,
        },
        {
            label: 'Save as a Global Variable',
            key: '1',
            onClick: openGlobalVariableModal,
        },
    ];

    return (
        <div>
            {/* Node's UI */}
            <div className={styles['plus-point-label']}>
                <span className={`${styles.iconD} ${styles.divideicon}`}>*</span>
            </div>
            <div className={`${styles['nodeBox']} ${styles.multidivide}`}>
                <div className={`flex gap-1 ${styles['node-main']}`}>
                    <div className={`flex gap-1 ${styles['node']}`}>
                        <div className={`flex gap-1 ${styles['nodewrap']}`}>
                            <PiMathOperationsBold className={styles.iconFlag} />
                            <div className={styles['node-text']}>
                                <h6>{data.label || "Multiplication / Division"}</h6>
                                <span>{data.variableType ? `Type: ${data.variableType}` : "No Type Connected"}</span>
                            </div>
                        </div>
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
            </div>
            <div className={styles['minus-point-label']}>
                <span className={styles.iconD}>/</span>
            </div>

            {/* Multiply Handle */}
            <Handle
                type="target"
                position={Position.Left}
                id="target1"
                className={styles.toppoint}
            />
            {/* Divide Handle */}
            <Handle
                type="target"
                position={Position.Left}
                id="target2"
                className={styles.bottompoint}
            />

            {/* Source Handle */}
            <CustomHandle
                nodeId={id}
                id="source"
                type="source"
                position={Position.Right}
                connectioncount={1}
            />

            {/* Modal for saving global variable */}
            <SaveGlobalVariableModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSave={handleSaveAsGlobalVariable}
            />
        </div>
    );
};

export default MultiplyDivide;
