import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Connection, Edge } from 'reactflow';
import { Select } from 'antd';
import 'reactflow/dist/style.css';

const AdditionSubNode = ({ id, data }: NodeProps<any>) => {
    const { getEdges, getNode, setNodes } = useReactFlow();
    const [result, setResult] = useState(0);
    const [operation, setOperation] = useState<string>('addition');
    const [firstValue, setFirstValue] = useState<number>(0);
    const [secondValue, setSecondValue] = useState<number>(0);

    useEffect(() => {
        const edges = getEdges().filter((edge) => edge.target === id);

        let firstVal = 0;
        let secondVal = 0;

        edges.forEach((edge) => {
            const sourceNode = getNode(edge.source);
            const sourceValue = sourceNode?.data?.value || sourceNode?.data?.result || 0;

            if (edge.targetHandle === 'target1') {
                firstVal = sourceValue;
            } else if (edge.targetHandle === 'target2') {
                secondVal = sourceValue;
            }
        });

        setFirstValue(firstVal);
        setSecondValue(secondVal);

        let calculatedResult = 0;
        if (operation === 'addition') {
            calculatedResult = firstVal + secondVal;
        } else if (operation === 'subtraction') {
            calculatedResult = firstVal - secondVal;
        }

        setResult(calculatedResult);

        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id
                    ? { ...node, data: { ...node.data, result: calculatedResult, operation } }
                    : node
            )
        );
    }, [getEdges, getNode, id, setNodes, operation]);

    const handleOperationChange = (value: string) => {
        setOperation(value);
    };

    const isValidConnection = (connection: Connection | Edge) => {
        const edges = getEdges().filter((edge) => edge.target === id);
        return edges.length < 2;
    };

    return (
        <div style={{ padding: '10px', border: '1px solid black', borderRadius: '5px' }}>
            <div>Add / Subtract Node</div>
            <div className="nodrag">
                <Select
                    defaultValue="addition"
                    style={{ width: 120, marginBottom: '10px' }}
                    onChange={handleOperationChange}
                >
                    <Select.Option value="addition">Addition</Select.Option>
                    <Select.Option value="subtraction">Subtraction</Select.Option>
                </Select>
            </div>
            <div>First Value: {firstValue}</div>
            <div>Second Value: {secondValue}</div>
            <div>Result: {result}</div>

            <Handle
                type="target"
                position={Position.Left}
                id="target1"
                isValidConnection={isValidConnection}
                style={{ top: '35%' }}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="target2"
                isValidConnection={isValidConnection}
                style={{ top: '65%' }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="source"
            />
        </div>
    );
};

export default AdditionSubNode;
