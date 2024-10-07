"use client";

import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  XYPosition,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';

interface DragAndDropContainerProps {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  workflowData: any;
  workflowName: string | null;
}

const transformWorkflowDataToFlow = (workflowData: any) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const rules = workflowData.data;

  Object.keys(rules).forEach((rule) => {
    const ruleNodes = rules[rule];

    if (Array.isArray(ruleNodes)) {
      ruleNodes.forEach((node: any) => {
        const newNode: Node = {
          id: node.id,
          data: {
            label: `${node.nodeData.type}: ${node.nodeData.table || ''}`,
            ...node.nodeData,
          },
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          draggable: true,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };

        nodes.push(newNode);

        if (Array.isArray(node.target)) {
          node.target.forEach((targetId: string) => {
            const newEdge: Edge = {
              id: `edge-${node.id}-${targetId}`,
              source: node.id,
              target: targetId,
              type: 'smoothstep',
              animated: true,
            };

            edges.push(newEdge);
          });
        }
      });
    } else {
      console.error('Expected ruleNodes to be an array, got:', ruleNodes);
    }
  });

  return { nodes, edges };
};

const DragAndDropContainer: React.FC<DragAndDropContainerProps> = ({
  nodes,
  setNodes,
  edges,
  setEdges,
  workflowData,
  workflowName,
}) => {
  useEffect(() => {
    if (workflowData) {
      const transformedData = transformWorkflowDataToFlow(workflowData);
      setNodes(transformedData.nodes);
      setEdges(transformedData.edges);
    }
  }, [workflowData, setNodes, setEdges]);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const jsonData = event.dataTransfer.getData('application/json');

      if (!jsonData) {
        console.error('No data to parse. Dragged item might not have data.');
        return;
      }

      try {
        const itemData = JSON.parse(jsonData);
        const id = `dropped-item-${nodes.length}`;
        const position: XYPosition = { x: event.clientX, y: event.clientY };

        const newNode: Node = {
          id,
          data: {
            table: itemData.title,
            type: itemData.title.toLowerCase(),
            label: `${itemData.title}: ${itemData.title.toLowerCase()}`,
          },
          position,
          draggable: true,
          targetPosition: Position.Left,
          sourcePosition: Position.Right,
        };

        setNodes((nds) => [...nds, newNode]);
      } catch (error) {
        console.error('Failed to parse JSON data:', error);
      }
    },
    [nodes, setNodes]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return (
    <div className={styles['home-container']} onDrop={handleDrop} onDragOver={handleDragOver}>
      <h3>Workflow: {workflowName}</h3>
      <ReactFlow nodes={nodes} edges={edges}>
        <Controls />
        <Background color="#5C5E64" gap={12} />
      </ReactFlow>
    </div>
  );
};

export default DragAndDropContainer;
