import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Connection, Edge } from 'reactflow';
import { Select } from 'antd';
import 'reactflow/dist/style.css';

const DivisionMultiplicationNode = ({ id }: NodeProps<any>) => {
    const { getEdges, getNode, setNodes } = useReactFlow();
    const [result, setResult] = useState<number | string>(1);
    const [operation, setOperation] = useState<string>('multiplication');
    const [firstValue, setFirstValue] = useState<number>(1);
    const [secondValue, setSecondValue] = useState<number>(1);

    useEffect(() => {
        const edges = getEdges().filter((edge) => edge.target === id);

        let firstVal = 1;
        let secondVal = 1;

        edges.forEach((edge) => {
            const sourceNode = getNode(edge.source);
            const sourceValue = sourceNode?.data?.value || sourceNode?.data?.result || 1;

            if (edge.targetHandle === 'target1') {
                firstVal = sourceValue;
            } else if (edge.targetHandle === 'target2') {
                secondVal = sourceValue;
            }
        });

        setFirstValue(firstVal);
        setSecondValue(secondVal);

        let calculatedResult: number | string = 0;
        if (operation === 'multiplication') {
            calculatedResult = firstVal * secondVal;
        } else if (operation === 'division') {
            calculatedResult = secondVal !== 0 ? firstVal / secondVal : 'Error (Div by 0)';
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

        const isTarget1Connected = edges.some((edge) => edge.targetHandle === 'target1');
        const isTarget2Connected = edges.some((edge) => edge.targetHandle === 'target2');

        if (connection.targetHandle === 'target1' && isTarget1Connected) return false;
        if (connection.targetHandle === 'target2' && isTarget2Connected) return false;

        return true;
    };

    return (
        <div style={{ padding: '10px', border: '1px solid black', borderRadius: '5px' }}>
            <div>Division / Multiplication Node</div>
            <div className="nodrag">
                <Select
                    defaultValue="multiplication"
                    style={{ width: 150, marginBottom: '10px' }}
                    onChange={handleOperationChange}
                >
                    <Select.Option value="multiplication">Multiplication</Select.Option>
                    <Select.Option value="division">Division</Select.Option>
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

export default DivisionMultiplicationNode;
