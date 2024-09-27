import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Handle, NodeProps, Position, useReactFlow, Connection, Edge, addEdge } from 'reactflow';
import { Form, Select, Dropdown, message } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { GiLogicGateNand } from "react-icons/gi";
import { BsThreeDots } from 'react-icons/bs';

const { Option } = Select;

const ConditionalNode = ({ id, data }: NodeProps<any>) => {
    const { getEdges, setNodes, setEdges, project } = useReactFlow();
    const [selectedOperator, setSelectedOperator] = useState(data.gateOperator);
    const [lhsType, setLhsType] = useState<string | null>(null);
    const [rhsType, setRhsType] = useState<string | null>(null);
    const [lhsValue, setLhsValue] = useState<string | null>(null);
    const [rhsValue, setRhsValue] = useState<string | null>(null);
    useEffect(() => {
        const edges = getEdges();
    
        const isLHSConnected = edges.some(edge => edge.targetHandle === 'target1' && edge.target === id);
        const isRHSConnected = edges.some(edge => edge.targetHandle === 'target2' && edge.target === id);
    
        if (isLHSConnected && isRHSConnected) {
            const newDummyNode1 = {
                id: 'dummy1',
                type: 'bezier',
                label: 'bezier',
                position: { x: 500, y: 400 }, 
                data: { label: '' },
                style: { opacity: 0 }, 
            };
    
            const newDummyNode2 = {
                id: 'dummy2',
                type: 'bezier',
                label: 'bezier',
                position: { x: 700, y: 700 }, 
                data: { label: '' },
                style: { opacity: 0 }, 
            };
    
            const newEdges: Edge[] = [
                {
                    id: `${id}-source1-edge`,
                    source: id,
                    sourceHandle: 'source1',
                    target: newDummyNode1.id,
                    targetHandle: null,
                    type: 'smoothstep',
                    animated: true,
                    data: { 
                        label: '', 
                        handles: [<Handle type="source" position={Position.Right} style={{ backgroundColor: 'black' }} />]
                    },
                    style: { stroke: 'gray', strokeWidth: 2, strokeDasharray: 0 },
                },
                {
                    id: `${id}-source2-edge`,
                    source: id,
                    sourceHandle: 'source2',
                    target: newDummyNode2.id,
                    targetHandle: null,
                    type: 'smoothstep',
                    animated: true,
                    data: { 
                        label: '', 
                        handles: [<Handle type="source" position={Position.Right} style={{ backgroundColor: 'black' }} />]
                    },
                    style: { stroke: 'gray', strokeWidth: 2, strokeDasharray: 0 },
                }
            ];
    
            setNodes((nds) => [...nds, newDummyNode1, newDummyNode2]);
            setEdges((eds) => [...eds, ...newEdges]); 
        }
    
        setLhsValue(data.lhsValue);
        setRhsValue(data.rhsValue);
    }, [data, getEdges, id, setEdges, setNodes]);    

    const handleOperatorChange = (value: string) => {
        setSelectedOperator(value);
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, gateOperator: value } } : node
            )
        );
    };

    const handleDeleteNode = () => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        message.success('Node deleted successfully');
    };

    const menuItems = [
        {
            label: 'Delete Node',
            key: '0',
            onClick: handleDeleteNode
        }
    ];

    return (
        <div>
            <div className={styles['lhs-point-label']}>
                LHS
            </div>
            <div className={`${styles['nodeBox']} ${styles.gateOperator}`} style={{ maxWidth: "300px" }}>
                <Form name="gate-operator" layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <GiLogicGateNand className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || "Conditional Node"}</h6>
                                    <span>{lhsType || rhsType ? `Type: ${lhsType || rhsType}` : "No Type Connected"}</span>
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

                        <div className={`flex gap-1 ${styles.formInput}`}>
                            <Form.Item className={`nodrag ${styles.widthInput} ${styles.fullwidth} customselect`}>
                                <Select
                                    className={`nodrag ${styles.inputField}`}
                                    placeholder="Select Operator"
                                    value={selectedOperator}
                                    onChange={handleOperatorChange}
                                >
                                    <Option value="Equal to">Equal to</Option>
                                    <Option value="Not equal to">Not equal to</Option>
                                    <Option value="Greater than">Greater than</Option>
                                    <Option value="Less than">Less than</Option>
                                    <Option value="Greater than or equal to">Greater than or equal to</Option>
                                    <Option value="Less than or equal to">Less than or equal to</Option>
                                </Select>
                            </Form.Item>
                            <span>{lhsValue && rhsValue ? `${lhsValue} ${selectedOperator} ${rhsValue}` : 'Connect nodes to see values'}</span>
                        </div>

                        <div className={styles['rhs-point-label']}>
                            RHS
                        </div>

                        <Handle
                            type="target"
                            position={Position.Left}
                            id="target1"
                            className={styles.leftpoint}
                        />
                        <Handle
                            type="target"
                            position={Position.Left}
                            id="target2"
                            className={styles.rightpoint}
                        />
                        <Handle type="source" id="source1" position={Position.Right} />
                        <Handle type="source" id="source2" position={Position.Bottom} />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ConditionalNode;