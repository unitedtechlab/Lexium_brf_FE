import React, { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  useReactFlow,
  Node,
  Edge,
  XYPosition,
  Position,
  Connection,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import styles from '../workflow.module.css';
import * as Icons from 'react-icons/sl';
import * as FaIcons from 'react-icons/fa';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import TableImage from '../../assets/images/layout.svg';
import { FiMoreHorizontal } from 'react-icons/fi';
import { Dropdown, message } from 'antd';
import { useEmail } from '@/app/context/emailContext';
import {
  Filter,
  Sort,
  Conditional,
  GroupBy,
  Statistical,
  NodeData,
  Arithmetic,
  Scaling,
  CustomNode,
  Condition,
  Merge,
} from '../../types/workflowTypes';

const FilterModal = dynamic(() => import('../modals/filtermodal'));
const SortModal = dynamic(() => import('../modals/sortmodal'));
const ConditionalModal = dynamic(() => import('../modals/conditionalModal'));
const GroupByModal = dynamic(() => import('../modals/groupbyModal'));
const StatisticalModal = dynamic(() => import('../modals/statisticalModal'));
const ScalingModal = dynamic(() => import('../modals/scalingModal'));
const ArithmeticModal = dynamic(() => import('../modals/arithmeticModal'));
const PivotTable = dynamic(() => import('../modals/pivotModal'));
const StartModal = dynamic(() => import('../modals/StartNodeModal'));
const OutputModal = dynamic(() => import('../modals/outputModal'));

type IconNames = keyof typeof Icons | keyof typeof FaIcons;

interface DragAndDropContainerProps {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  onNodesChange: (changes: any) => void;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onEdgesChange: (changes: any) => void;
  workspaces: any[];
  folders: any[];
  selectedWorkspace: string | null;
  setSidebarItems: React.Dispatch<React.SetStateAction<any[]>>;
}

const DragAndDropContainer: React.FC<DragAndDropContainerProps> = ({
  nodes,
  setNodes,
  onNodesChange,
  edges,
  setEdges,
  onEdgesChange,
  workspaces,
  folders,
  selectedWorkspace,
  setSidebarItems,
}) => {
  const { email } = useEmail();
  const { screenToFlowPosition } = useReactFlow();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState<boolean>(false);
  const [isConditionalModalVisible, setIsConditionalModalVisible] = useState<boolean>(false);
  const [isGroupByModalVisible, setIsGroupByModalVisible] = useState<boolean>(false);
  const [isStatisticalModalVisible, setIsStatisticalModalVisible] = useState<boolean>(false);
  const [isScalingModalVisible, setIsScalingModalVisible] = useState<boolean>(false);
  const [isArithmeticModalVisible, setIsArithmeticModalVisible] = useState<boolean>(false);
  const [isPivotTableModalVisible, setIsPivotTableModalVisible] = useState<boolean>(false);
  const [isStartModalVisible, setIsStartModalVisible] = useState<boolean>(false);
  const [isOutputModalVisible, setIsOutputModalVisible] = useState<boolean>(false);
  const [confirmedDataType, setConfirmedDataType] = useState<string | null>(null);

  const [currentEditNodeData, setCurrentEditNodeData] = useState<{
    id: string;
    position: XYPosition;
    icon: keyof typeof Icons | keyof typeof FaIcons;
    pivotTable?: any;
  } | null>(null);

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isMergeNodeDropped, setIsMergeNodeDropped] = useState<boolean>(false);

  const showModal = useCallback((nodeData: { id: string; position: XYPosition; icon: keyof typeof Icons | keyof typeof FaIcons }) => {
    setCurrentEditNodeData(nodeData);
    setIsModalVisible(true);
  }, []);

  const showFilterModal = useCallback((nodeData: { id: string; position: XYPosition; icon: IconNames; column?: string; operator?: string; value?: string }) => {
    setCurrentEditNodeData(nodeData);
    setIsFilterModalVisible(true);
  }, []);


  const showSortModal = useCallback((nodeData: { id: string; position: XYPosition; icon: keyof typeof Icons | keyof typeof FaIcons }) => {
    setCurrentEditNodeData(nodeData);
    setIsSortModalVisible(true);
  }, []);

  const showConditionalModal = useCallback((nodeData: { id: string; position: XYPosition; icon: keyof typeof Icons | keyof typeof FaIcons }) => {
    setCurrentEditNodeData(nodeData);
    setIsConditionalModalVisible(true);
  }, []);

  const showGroupByModal = useCallback((nodeData: { id: string; position: XYPosition; icon: keyof typeof Icons | keyof typeof FaIcons }) => {
    setCurrentEditNodeData(nodeData);
    setIsGroupByModalVisible(true);
  }, []);

  const showStatisticalModal = useCallback((nodeData: { id: string; position: XYPosition; icon: keyof typeof Icons | keyof typeof FaIcons }) => {
    setCurrentEditNodeData(nodeData);
    setIsStatisticalModalVisible(true);
  }, []);

  const showScalingModal = useCallback((nodeData: { id: string; position: XYPosition; icon: keyof typeof Icons | keyof typeof FaIcons }) => {
    setCurrentEditNodeData(nodeData);
    setIsScalingModalVisible(true);
  }, []);

  const showArithmeticModal = useCallback((nodeData: { id: string; position: XYPosition; icon: keyof typeof Icons | keyof typeof FaIcons }) => {
    setCurrentEditNodeData(nodeData);
    setIsArithmeticModalVisible(true);
  }, []);

  const showPivotTableModal = useCallback((nodeData: { id: string; position: XYPosition; icon: keyof typeof Icons | keyof typeof FaIcons, pivotTable: any }) => {
    setCurrentEditNodeData(nodeData);
    setIsPivotTableModalVisible(true);
  }, []);

  const showStartModal = useCallback((nodeData: { id: string; position: XYPosition; icon: keyof typeof Icons | keyof typeof FaIcons }) => {
    setCurrentEditNodeData(nodeData);
    setIsStartModalVisible(true);
  }, []);

  const showOutputModal = useCallback((nodeData: { id: string; position: XYPosition; icon: keyof typeof Icons | keyof typeof FaIcons }) => {
    setCurrentEditNodeData(nodeData);
    setIsOutputModalVisible(true);
  }, []);

  const handleEdit = useCallback(
    (nodeId: string) => {
      const nodeToEdit = nodes.find((node) => node.id === nodeId);
      if (nodeToEdit) {
        const { type, ...nodeData } = nodeToEdit.data;

        const editData = {
          id: nodeId,
          position: nodeToEdit.position,
          icon: 'FaEdit' as IconNames,
          ...nodeData,
        };

        setCurrentEditNodeData(editData);

        switch (type) {
          case 'filter':
            setIsFilterModalVisible(true);
            break;
          case 'sort':
            setIsSortModalVisible(true);
            break;
          case 'if/else/and/or':
            setIsConditionalModalVisible(true);
            break;
          case 'groupby':
            setIsGroupByModalVisible(true);
            break;
          case 'statistical':
            setIsStatisticalModalVisible(true);
            break;
          case 'scaling':
            setIsScalingModalVisible(true);
            break;
          case 'arithmetic':
            setIsArithmeticModalVisible(true);
            break;
          case 'pivot':
            setIsPivotTableModalVisible(true);
            break;
          case 'output':
            setIsOutputModalVisible(true);
            break;
          case 'startingnode':
            setIsStartModalVisible(true);
            break;
          default:
            console.error('Unknown node type:', type);
        }
      } else {
        console.error('Node not found:', nodeId);
      }
    },
    [
      nodes,
      setIsFilterModalVisible,
      setIsSortModalVisible,
      setIsConditionalModalVisible,
      setIsGroupByModalVisible,
      setIsStatisticalModalVisible,
      setIsScalingModalVisible,
      setIsArithmeticModalVisible,
      setIsPivotTableModalVisible,
      setIsOutputModalVisible,
      setIsStartModalVisible,
    ]
  );
  const handleReadMore = useCallback(
	(nodeId : string) => {
		
	},[]
)

  const handleDelete = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const nodeToDelete = nds.find((node) => node.id === nodeId);

        if (nodeToDelete) {
          if (nodeToDelete.data?.isParentNode) {
            const childNodeIds = nds
              .filter((node) => node.data?.parentId === nodeId)
              .map((node) => node.id);

            return nds.filter((node) => ![nodeId, ...childNodeIds].includes(node.id));
          }

          if (nodeToDelete.data?.parentId) {
            return nds.filter((node) => node.id !== nodeId);
          }
          return nds.filter((node) => node.id !== nodeId);
        }

        return nds;
      });

      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  const createNodeLabel = (table: string, nodeType: string, data?: NodeData, nodeId?: string, isStartingPoint?: boolean, isEndingPoint?: boolean) => (
    <>
      {isStartingPoint && (
        <div className={styles['starting-point-label']}>
          STARTING POINT
        </div>
      )}
      {isEndingPoint && (
        <div className={styles['starting-point-label']}>
          ENDING POINT
        </div>
      )}
      <div className={styles['node-content']}>
        <div className={`flex gap-1 ${styles['node-main']}`}>
          <div className={`flex gap-1 ${styles['node']}`}>
            <div className={`flex gap-1 ${styles['nodewrap']}`}>
              <Image src={TableImage} alt='Table Image' width={32} height={32} />
              <div className={styles['node-text']}>
                <h6>{table}</h6>
                <span>{nodeType}</span>
              </div>
            </div>
            <Dropdown
              menu={{
                items: [
                  { label: 'Delete', key: '0', onClick: () => handleDelete(nodeId!) },
                  { label: 'Edit', key: '1', onClick: () => handleEdit(nodeId!) },
                  { label: 'Read more', key: '2', onClick: () => handleReadMore(nodeId!) },
                ]
              }}
              trigger={['click']}
            >
              <a onClick={(e) => e.preventDefault()} className='iconFont'>
                <FiMoreHorizontal />
              </a>
            </Dropdown>
          </div>
          {nodeType !== 'Else Node' && data && (
            <div className={styles.filterStyle}>
              {nodeType === 'Filter Node' && 'column' in data && (
                <>
                  <p>Selected Column: <b>{(data as Filter).column}</b></p>
                  <p>Operator: <b>{(data as Filter).operator}</b></p>
                  <p>Value: <b>{(data as Filter).value}</b></p>
                </>
              )}
              {nodeType === 'Sort Node' && 'column' in data && (
                <>
                  <p>Selected Column: <b>{(data as Sort).column}</b></p>
                  <p>Sort Type: <b>{(data as Sort).sortType}</b></p>
                </>
              )}
              {nodeType === 'Conditional Node' && 'conditionType' in data && (
                <p>Condition Type: <b>{(data as Conditional).conditionType}</b></p>
              )}
              {nodeType !== 'Conditional Node' && nodeType.includes('Node') && 'conditions' in data && (
                <>
                  {(data as Conditional).conditions.map((condition, index) => (
                    <div key={index} className={styles.conditionNodeData}>
                      <ul className={styles.listNodeShow}>
                        <li>Column Name: <b>{condition.column}</b></li>
                        <li>Condition Name: <b>{condition.condition}</b></li>
                        <li>Compare value: <b>{condition.value}</b></li>
                        {condition.subConditions && condition.subConditions.length > 0 && (
                          <>
                            <hr />
                            <h6>Sub Conditions:</h6>
                            {condition.subConditions.map((subCondition, subIndex) => (
                              <ul key={subIndex} className={styles.listNodeShow}>
                                <li>Operator: <b>{subCondition.operator ? subCondition.operator.toUpperCase() : 'AND'}</b></li>
                                <li>Column Name: <b>{subCondition.column}</b></li>
                                <li>Condition Name: <b>{subCondition.condition}</b></li>
                                <li>Compare value: <b>{subCondition.value}</b></li>
                              </ul>
                            ))}
                          </>
                        )}
                        {condition.outsideConditions && condition.outsideConditions.length > 0 && (
                          <>
                            <hr />
                            <h6>Outside Conditions:</h6>
                            {condition.outsideConditions.map((outsideCondition, outIndex) => (
                              <ul key={outIndex} className={styles.listNodeShow}>
                                <li>Operator: <b>{outsideCondition.operator ? outsideCondition.operator.toUpperCase() : 'AND'}</b></li>
                                <li>Column Name: <b>{outsideCondition.column}</b></li>
                                <li>Condition Name: <b>{outsideCondition.condition}</b></li>
                                <li>Compare value: <b>{outsideCondition.value}</b></li>
                              </ul>
                            ))}
                          </>
                        )}
                      </ul>
                    </div>
                  ))}
                </>
              )}
              {nodeType === 'Group By Node' && 'groupByColumns' in data && (
                <>
                  <p>Group By Columns: <b>{data.groupByColumns?.join(', ') || 'No Columns'}</b></p>
                  <p>Target Columns: <b>{data.targetColumns?.join(', ') || 'No Columns'}</b></p>
                  <hr />
                  <p>Functions:</p>
                  <ul>
                    {data.functionCheckboxes &&
                      Object.keys(data.functionCheckboxes).map(column => (
                        <li key={column}>
                          <p>{column}: <b>{data.functionCheckboxes?.[column]?.join(', ') || 'No Functions'}</b></p>
                        </li>
                      ))}
                  </ul>
                </>
              )}

              {nodeType === 'Statistical Node' && 'statisticalFunction' in data && (
                <>
                  <p>Selected Column: <b>{data.column}</b></p>
                  <p>Function: <b>{data.statisticalFunction}</b></p>
                </>
              )}
              {nodeType === 'Scaling Node' && (
                <>
                  <p>Selected Column: <b>{(data as Scaling).column}</b></p>
                  <p>Function: <b>{(data as Scaling).scalingFunction}</b></p>
                  {(data as Scaling).minValue && (
                    <p>Min Value: <b>{(data as Scaling).minValue}</b></p>
                  )}
                  {(data as Scaling).maxValue && (
                    <p>Max Value: <b>{(data as Scaling).maxValue}</b></p>
                  )}
                </>
              )}
              {nodeType === 'Arithmetic Node' && 'sourceColumn' in data && (
                <>
                  <p>Operation: <b>{(data as Arithmetic).operation}</b></p>
                </>
              )}
              {nodeType === 'Pivot Node' && data && (data as CustomNode).pivotTable && (
                <div className={styles.pivotNodeData}>
                  <p>Index Columns: <b>{(data as CustomNode).pivotTable!.pivotColumns.index.join(', ')}</b></p>
                  <p>Column Columns: <b>{(data as CustomNode).pivotTable!.pivotColumns.column.join(', ')}</b></p>
                  <p>Value Columns: <b>{(data as CustomNode).pivotTable!.pivotColumns.value.join(', ')}</b></p>
                  <hr />
                  <p>Functions:</p>
                  <ul>
                    {Object.keys((data as CustomNode).pivotTable!.functionCheckboxes).map(column => (
                      <li key={column}>
                        <p>{column}: <b>{(data as CustomNode).pivotTable!.functionCheckboxes[column].join(', ')}</b></p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {nodeType === 'Starting Node' && 'mergeType' in data && (
                <>
                  <p>Table 1: <b>{data.table1}</b></p>
                  <p>Column 1: <b>{data.column1}</b></p>
                  <p>Merge Type: <b>{data.mergeType}</b></p>
                  <p>Table 2: <b>{data.table2}</b></p>
                  <p>Column 2: <b>{data.column2}</b></p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const handleStartModalOk = useCallback(
    (values: any, isMergeSelected: boolean) => {
      if (currentEditNodeData) {
        const tableName = isMergeSelected ? `${values.table1} & ${values.table2}` : values.table1Single;

        const nodeType = isMergeSelected ? 'mergeTable' : 'table';

        const labelContent = isMergeSelected
          ? createNodeLabel(
            tableName,
            'Starting Node',
            {
              mergeType: values.mergeType,
              table1: values.table1,
              column1: values.column1,
              table2: values.table2,
              column2: values.column2,
            },
            currentEditNodeData.id,
            true
          )
          : createNodeLabel(tableName, 'Starting Node', undefined, currentEditNodeData.id, true);

        const newNode: Node = {
          id: currentEditNodeData.id,
          data: {
            type: nodeType,
            table: tableName,
            start: {
              mergeType: values.mergeType || 'Single Table',
              table1: isMergeSelected ? values.table1 : values.table1Single,
              column1: isMergeSelected ? values.column1 : '',
              table2: isMergeSelected ? values.table2 : '',
              column2: isMergeSelected ? values.column2 : '',
            },
            label: labelContent,
          },
          position: currentEditNodeData.position,
          draggable: true,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };

        setNodes((nds) => [...nds.filter(node => node.id !== currentEditNodeData.id), newNode]);
        setSelectedTable(tableName);
        setIsStartModalVisible(false);
        setIsMergeNodeDropped(true);

        setSidebarItems((items) => items.map((item) => (item.id !== 'start' ? { ...item, enabled: true } : item)));
      }
    },
    [currentEditNodeData, setNodes, setSidebarItems]
  );

  const handleOutputModalOk = useCallback(
    (values: any) => {
      if (currentEditNodeData) {
        const newNode: Node = {
          id: currentEditNodeData.id,
          data: {
            type: 'output',
            output: {
              outputName: values.outputName,
            },
            label: createNodeLabel(values.outputName, 'Output Node', undefined, currentEditNodeData.id, false, true),
          },
          position: currentEditNodeData.position,
          draggable: true,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };

        setNodes((nds) => [...nds.filter(node => node.id !== currentEditNodeData.id), newNode]);
        setSelectedTable(null);
        setIsOutputModalVisible(false);
      }
    },
    [currentEditNodeData, setNodes]
  );

  const handlePivotTableModalOk = useCallback(
    (values: any) => {
      if (currentEditNodeData && selectedTable) {
        const newNode: Node = {
          id: currentEditNodeData.id,
          data: {
            table: selectedTable,
            type: 'pivotTable',
            pivotTable: {
              pivotColumns: values.pivotColumns,
              functionCheckboxes: values.functionCheckboxes,
            },
            label: createNodeLabel(
              selectedTable,
              'Pivot Node',
              {
                type: 'pivotTable',
                pivotTable: {
                  pivotColumns: values.pivotColumns,
                  functionCheckboxes: values.functionCheckboxes,
                },
              },
              currentEditNodeData.id
            ),
          },
          position: currentEditNodeData.position,
          draggable: true,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };

        setNodes((nds) => [...nds.filter(node => node.id !== currentEditNodeData.id), newNode]);
        setIsPivotTableModalVisible(false);
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes]
  );

  const handleGroupByModalOk = useCallback(
    (values: any) => {
      if (currentEditNodeData && selectedTable) {
        const newNode: Node = {
          id: currentEditNodeData.id,
          data: {
            table: selectedTable,
            type: 'groupby',
            groupby: {
              groupByColumns: values.groupbyColumn.index,
              targetColumns: values.groupbyColumn.value,
              functionCheckboxes: values.functionCheckboxes,
            },
            label: createNodeLabel(
              selectedTable,
              'Group By Node',
              {
                groupByColumns: values.groupbyColumn.index,
                targetColumns: values.groupbyColumn.value,
                functionCheckboxes: values.functionCheckboxes,
              },
              currentEditNodeData.id
            ),
          },
          position: currentEditNodeData.position,
          draggable: true,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };

        setNodes((nds) => [...nds.filter(node => node.id !== currentEditNodeData.id), newNode]);
        setSelectedTable(null);
        setIsGroupByModalVisible(false);
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes]
  );

  const handleConditionalModalOk = useCallback(
    (values: any) => {
      if (currentEditNodeData && selectedTable) {
        const basePosition = currentEditNodeData.position;
        const offsetX = 250;
        const offsetY = 100;

        const conditionsData = values.conditions.map((condition: Condition, index: number) => {
          const conditionTypeLabel =
            values.conditionType === 'if/else'
              ? index === 0
                ? 'If'
                : 'Else'
              : values.conditionType === 'else/if'
                ? index === 0
                  ? 'If'
                  : index === 1
                    ? 'Else If'
                    : 'Else'
                : 'If';

          const isElseCondition = conditionTypeLabel === 'Else';

          return {
            id: `${currentEditNodeData.id}-${index}`,
            conditionType: conditionTypeLabel,
            conditions: isElseCondition ? [] : [{
              column: condition.column,
              condition: condition.condition,
              value: condition.value,
              subConditions: condition.subConditions || [],
              outsideConditions: condition.outsideConditions || [],
            }]
          };
        });

        const mainNode: Node = {
          id: currentEditNodeData.id,
          data: {
            table: selectedTable,
            type: 'conditional',
            isParentNode: true,
            conditional: conditionsData,
            label: createNodeLabel(
              selectedTable,
              'Conditional Node',
              {
                conditionType: values.conditionType,
                conditions: conditionsData,
              },
              currentEditNodeData.id
            ),
          },
          position: basePosition,
          draggable: true,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };

        // Child nodes for each condition
        const newNodes: Node[] = conditionsData.map((conditionData: any, index: number) => ({
          id: conditionData.id,
          data: {
            table: selectedTable,
            type: conditionData.conditionType.toLowerCase(),
            parentId: currentEditNodeData.id,
            conditional: conditionData,
            label: createNodeLabel(
              selectedTable,
              `${conditionData.conditionType} Node`,
              conditionData,
              conditionData.id
            ),
          },
          position: {
            x: basePosition.x + offsetX * index,
            y: basePosition.y + offsetY * index,
          },
          draggable: true,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        }));

        setNodes((nds) => [...nds.filter(node => node.id !== currentEditNodeData.id), mainNode, ...newNodes]);
        setEdges((eds) =>
          eds.concat(
            newNodes.map((node: Node, index: number) => ({
              id: `edge-${currentEditNodeData.id}-${node.id}`,
              source: currentEditNodeData.id,
              target: node.id,
              type: 'smoothstep',
              animated: true,
              label: index === 0 ? 'True' : 'False',
            }))
          )
        );

        setSelectedTable(null);
        setIsConditionalModalVisible(false);
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes, setEdges]
  );


  const handleSortModalOk = useCallback(
    (values: any) => {
      if (currentEditNodeData && selectedTable) {
        const newNode: Node = {
          id: currentEditNodeData.id,
          data: {
            table: selectedTable,
            type: 'sort',
            sort: {
              column: values.column,
              sortType: values.sortType,
            },
            label: createNodeLabel(
              selectedTable,
              'Sort Node',
              {
                column: values.column,
                sortType: values.sortType,
              },
              currentEditNodeData.id
            ),
          },
          position: currentEditNodeData.position,
          draggable: true,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };

        setNodes((nds) => [...nds.filter(node => node.id !== currentEditNodeData.id), newNode]);
        setSelectedTable(null);
        setIsSortModalVisible(false);
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes]
  );

  const handleFilterModalOk = useCallback(
    (values: any) => {
      if (currentEditNodeData && selectedTable) {
        const newNode: Node = {
          id: currentEditNodeData.id,
          data: {
            table: selectedTable,
            type: 'filter',
            filter: {
              column: values.column,
              operator: values.operator,
              value: values.value,
            },
            label: createNodeLabel(
              selectedTable,
              'Filter Node',
              {
                column: values.column,
                operator: values.operator,
                value: values.value,
              },
              currentEditNodeData.id
            ),
          },
          position: currentEditNodeData.position,
          draggable: true,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };

        setNodes((nds) => [...nds.filter(node => node.id !== currentEditNodeData.id), newNode]);
        setSelectedTable(null);
        setIsFilterModalVisible(false);
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes, confirmedDataType]
  );

  const handleStatisticalModalOk = useCallback(
    (values: any) => {
      if (currentEditNodeData && selectedTable) {
        const newNode: Node = {
          id: currentEditNodeData.id,
          data: {
            table: selectedTable,
            type: 'statistical',
            statistical: {
              column: values.column,
              statisticalFunction: values.statisticalfunction,
            },
            label: createNodeLabel(
              selectedTable,
              'Statistical Node',
              {
                column: values.column,
                statisticalFunction: values.statisticalfunction,
              },
              currentEditNodeData.id
            ),
          },
          position: currentEditNodeData.position,
          draggable: true,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };

        setNodes((nds) => [...nds.filter(node => node.id !== currentEditNodeData.id), newNode]);
        setSelectedTable(null);
        setIsStatisticalModalVisible(false);
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes]
  );

  const handleScalingModalOk = useCallback(
    (values: any) => {
      if (currentEditNodeData && selectedTable) {
        const newNode: Node = {
          id: currentEditNodeData.id,
          data: {
            table: selectedTable,
            type: 'scaling',
            scaling: {
              column: values.column,
              scalingFunction: values.scalingFunction,
              minValue: values.minValue,
              maxValue: values.maxValue,
            },
            label: createNodeLabel(
              selectedTable,
              'Scaling Node',
              {
                column: values.column,
                scalingFunction: values.scalingFunction,
                minValue: values.minValue,
                maxValue: values.maxValue,
              },
              currentEditNodeData.id
            ),
          },
          position: currentEditNodeData.position,
          draggable: true,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };

        setNodes((nds) => [...nds.filter(node => node.id !== currentEditNodeData.id), newNode]);
        setSelectedTable(null);
        setIsScalingModalVisible(false);
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes]
  );

  const handleArithmeticModalOk = useCallback(
    (values: any) => {
      if (currentEditNodeData && selectedTable) {
        const labelContent = values.operation;

        const newNode: Node = {
          id: currentEditNodeData.id,
          data: {
            table: selectedTable,
            type: 'arithmetic',
            arithmetic: {
              sourceColumn: values.sourceColumns,
              targetvalue: values.targetvalue,
              operation: labelContent,
            },
            label: createNodeLabel(
              selectedTable,
              'Arithmetic Node',
              {
                sourceColumn: values.sourceColumns,
                targetvalue: values.targetvalue,
                operation: labelContent,
              },
              currentEditNodeData.id
            ),
          },
          position: currentEditNodeData.position,
          draggable: true,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };

        setNodes((nds) => [...nds.filter(node => node.id !== currentEditNodeData.id), newNode]);
        setSelectedTable(null);
        setIsArithmeticModalVisible(false);
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes]
  );

  const handleCancel = useCallback(() => {
    setSelectedTable(null);
    setIsOutputModalVisible(false);
    setIsModalVisible(false);
    setIsFilterModalVisible(false);
    setIsSortModalVisible(false);
    setIsConditionalModalVisible(false);
    setIsGroupByModalVisible(false);
    setIsStatisticalModalVisible(false);
    setIsScalingModalVisible(false);
    setIsArithmeticModalVisible(false);
    setIsPivotTableModalVisible(false);
    setIsStartModalVisible(false);
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) {
        return;
      }

      if (sourceNode.data.type !== 'output' && targetNode.data.type === 'output') {
        setEdges((eds) => addEdge(connection, eds));
      } else if (sourceNode.data.type !== 'output' && targetNode.data.type !== 'start') {
        const sourceTables = (sourceNode.data.table || '').split(' & ').map((table: string) => table.trim());
        const targetTables = (targetNode.data.table || '').split(' & ').map((table: string) => table.trim());

        const canConnect = sourceTables.some((table: string) => targetTables.includes(table));

        if (canConnect) {
          setEdges((eds) => addEdge(connection, eds));
        } else {
          message.error('Cannot connect nodes with different table or folder names.');
        }
      } else {
        message.error('Invalid connection: ensure nodes are connected in a proper sequence.');
      }
    },
    [nodes, setEdges]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const jsonData = event.dataTransfer.getData('application/json');

      let itemData;
      try {
        if (jsonData) {
          itemData = JSON.parse(jsonData);
        } else {
          console.error('No data to parse.');
          return;
        }
      } catch (error) {
        console.error('Failed to parse JSON data:', error);
        return;
      }

      const id = `dropped-item-${nodes.length}`;
      const position: XYPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id,
        data: {
          table: itemData.title,
          type: itemData.title.toLowerCase().replace(' ', ''),
          label: createNodeLabel(itemData.title, itemData.title.toLowerCase().replace(' ', '')),
        },
        position,
        draggable: true,
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
      };

      setNodes((nds) => [...nds, newNode]);

      if (itemData.title === 'Filter') {
        showFilterModal({ id, position, icon: itemData.icon as keyof typeof Icons | keyof typeof FaIcons });
      } else if (itemData.title === 'Output') {
        showOutputModal({ id, position, icon: itemData.icon as keyof typeof Icons | keyof typeof FaIcons });
      } else if (itemData.title === 'Sort') {
        showSortModal({ id, position, icon: itemData.icon as keyof typeof Icons | keyof typeof FaIcons });
      } else if (itemData.title === 'IF/Else/And/OR') {
        showConditionalModal({ id, position, icon: itemData.icon as keyof typeof Icons | keyof typeof FaIcons });
      } else if (itemData.title === 'Group By') {
        showGroupByModal({ id, position, icon: itemData.icon as keyof typeof Icons | keyof typeof FaIcons });
      } else if (itemData.title === 'Statistical') {
        showStatisticalModal({ id, position, icon: itemData.icon as keyof typeof Icons | keyof typeof FaIcons });
      } else if (itemData.title === 'Scaling') {
        showScalingModal({ id, position, icon: itemData.icon as keyof typeof Icons | keyof typeof FaIcons });
      } else if (itemData.title === 'Arithmetic') {
        showArithmeticModal({ id, position, icon: itemData.icon as keyof typeof Icons | keyof typeof FaIcons });
      } else if (itemData.title === 'Pivot') {
        showPivotTableModal({ id, position, icon: itemData.icon as keyof typeof Icons | keyof typeof FaIcons, pivotTable: itemData.pivotTable });
      } else if (itemData.title === 'Starting Node') {
        showStartModal({ id, position, icon: itemData.icon as keyof typeof Icons | keyof typeof FaIcons });
      }
    },
    [
      nodes,
      screenToFlowPosition,
      showModal,
      showFilterModal,
      showSortModal,
      showPivotTableModal,
      showConditionalModal,
      showGroupByModal,
      showStatisticalModal,
      showScalingModal,
      showArithmeticModal,
      showStartModal,
      setNodes,
    ]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return (
    <>
      <div className={styles['home-container']} onDrop={handleDrop} onDragOver={handleDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
        >
          <Controls />
          <Background color="#5C5E64" gap={12} />
        </ReactFlow>

        {email && (
          <>
            <StartModal
              isModalVisible={isStartModalVisible}
              handleOkay={handleStartModalOk}
              handleCancel={handleCancel}
              setSelectedTable={setSelectedTable}
              workspaces={workspaces}
              folders={folders}
              selectedWorkspace={selectedWorkspace}
              email={email}
            />
            <OutputModal
              isModalVisible={isOutputModalVisible}
              handleOkay={handleOutputModalOk}
              handleCancel={handleCancel}
              selectedWorkspace={selectedWorkspace}
              email={email}
            />
            <GroupByModal
              isModalVisible={isGroupByModalVisible}
              handleOk={handleGroupByModalOk}
              handleCancel={handleCancel}
              setSelectedTable={setSelectedTable}
              workspaces={workspaces}
              folders={folders}
              selectedWorkspace={selectedWorkspace}
              email={email}
            />
            <FilterModal
              isModalVisible={isFilterModalVisible}
              handleOkay={handleFilterModalOk}
              handleCancel={handleCancel}
              initialValues={currentEditNodeData}
              setSelectedTable={setSelectedTable}
              workspaces={workspaces}
              folders={folders}
              selectedWorkspace={selectedWorkspace}
              email={email}
            />
            <PivotTable
              isModalVisible={isPivotTableModalVisible}
              handleOk={handlePivotTableModalOk}
              handleCancel={handleCancel}
              setSelectedTable={setSelectedTable}
              workspaces={workspaces}
              folders={folders}
              selectedWorkspace={selectedWorkspace}
              email={email}
              initialValues={currentEditNodeData?.pivotTable}
            />
            <SortModal
              isModalVisible={isSortModalVisible}
              handleOkay={handleSortModalOk}
              handleCancel={handleCancel}
              setSelectedTable={setSelectedTable}
              workspaces={workspaces}
              folders={folders}
              selectedWorkspace={selectedWorkspace}
              email={email}
            />
            <ConditionalModal
              isModalVisible={isConditionalModalVisible}
              handleOkay={handleConditionalModalOk}
              handleCancel={handleCancel}
              setSelectedTable={setSelectedTable}
              workspaces={workspaces}
              folders={folders}
              selectedWorkspace={selectedWorkspace}
              email={email}
            />
            <StatisticalModal
              isModalVisible={isStatisticalModalVisible}
              handleOkay={handleStatisticalModalOk}
              handleCancel={handleCancel}
              setSelectedTable={setSelectedTable}
              workspaces={workspaces}
              folders={folders}
              selectedWorkspace={selectedWorkspace}
              email={email}
            />
            <ScalingModal
              isModalVisible={isScalingModalVisible}
              handleOkay={handleScalingModalOk}
              handleCancel={handleCancel}
              setSelectedTable={setSelectedTable}
              workspaces={workspaces}
              folders={folders}
              selectedWorkspace={selectedWorkspace}
              email={email}
            />
            <ArithmeticModal
              isModalVisible={isArithmeticModalVisible}
              handleOkay={handleArithmeticModalOk}
              handleCancel={handleCancel}
              setSelectedTable={setSelectedTable}
              workspaces={workspaces}
              folders={folders}
              selectedWorkspace={selectedWorkspace}
              email={email}
            />
          </>
        )}
      </div>
    </>
  );
};

const DragAndDropContainerWithProvider: React.FC<DragAndDropContainerProps> = (props) => (
  <ReactFlowProvider>
    <DragAndDropContainer {...props} />
  </ReactFlowProvider>
);

export default DragAndDropContainerWithProvider;
