import React from 'react';
import { EdgeProps, getBezierPath, useReactFlow } from 'reactflow';
import { IoIosCloseCircle } from "react-icons/io";

const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
}: EdgeProps) => {
    const { setEdges } = useReactFlow();

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    const handleRemoveEdge = () => {
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    return (
        <>
            <path
                id={id}
                style={style}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
            />
            <foreignObject
                width={20}
                height={20}
                x={labelX - 10}
                y={labelY - 10}
                style={{ cursor: 'pointer' }}
            >
                <div onClick={handleRemoveEdge}>
                    <IoIosCloseCircle style={{ color: 'red', fontSize: "20px" }} />
                </div>
            </foreignObject>
        </>
    );
};

export default CustomEdge;
