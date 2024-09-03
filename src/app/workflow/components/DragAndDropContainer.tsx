import React, { useCallback, useState, useEffect } from 'react';
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
import Image from 'next/image';
import TableImage from '../../assets/images/layout.svg';
import { FiMoreHorizontal } from 'react-icons/fi';
import { Dropdown, message } from 'antd';
import { useEmail } from '@/app/context/emailContext';
import {
  Filter, Sort, Conditional, GroupBy, Statistical, NodeData, Arithmetic, Scaling, CustomNode, Condition, Merge
} from '../../types/workflowTypes';
import WorkflowModals from './WorkflowModals';

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
  outputNodeIds: string[];
  setOutputNodeIds: React.Dispatch<React.SetStateAction<string[]>>;
  workflowOutput: any;
  isRunClicked: boolean;
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
  outputNodeIds,
  workflowOutput,
  setOutputNodeIds,
  isRunClicked,
}) => {
  const { email } = useEmail();
  const { screenToFlowPosition } = useReactFlow();
  const [currentEditNodeData, setCurrentEditNodeData] = useState<{
    id: string;
    position: XYPosition;
    icon: keyof typeof Icons | keyof typeof FaIcons;
    pivotTable?: any;
  } | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isStartingNodeSaved, setIsStartingNodeSaved] = useState<boolean>(false);

  const [modalVisibility, setModalVisibility] = useState({
    isStartModalVisible: false,
    isOutputModalVisible: false,
    isFilterModalVisible: false,
    isSortModalVisible: false,
    isConditionalModalVisible: false,
    isGroupByModalVisible: false,
    isStatisticalModalVisible: false,
    isScalingModalVisible: false,
    isArithmeticModalVisible: false,
    isPivotTableModalVisible: false,
  });

  const modalKeyMap: { [key: string]: keyof typeof modalVisibility } = {
    Filter: 'isFilterModalVisible',
    Output: 'isOutputModalVisible',
    Sort: 'isSortModalVisible',
    'IF/Else/And/OR': 'isConditionalModalVisible',
    'Group By': 'isGroupByModalVisible',
    Statistical: 'isStatisticalModalVisible',
    Scaling: 'isScalingModalVisible',
    Arithmetic: 'isArithmeticModalVisible',
    Pivot: 'isPivotTableModalVisible',
    'Starting Node': 'isStartModalVisible',
  };

  const showModal = useCallback((modalType: keyof typeof modalVisibility) => {
    setModalVisibility(prev => ({ ...prev, [modalType]: true }));
  }, []);

  const hideModal = useCallback((modalType: keyof typeof modalVisibility) => {
    setModalVisibility(prev => ({ ...prev, [modalType]: false }));
  }, []);


  // Modal handlers
  const handleStartModalOk = useCallback(
    (values: any) => {
      const isMergeSelected = values.table1 && values.table2 ? true : false;

      if (currentEditNodeData) {
        const tableName = isMergeSelected ? `${values.table1} & ${values.table2}` : values.table1Single;
        const nodeType = isMergeSelected ? 'mergeTable' : 'table';

        const nodeData: CustomNode = {
          type: nodeType,
          table: tableName,
          ...(isMergeSelected ? {
            merge: {
              mergeType: values.mergeType,
              table1: values.table1,
              column1: values.column1,
              table2: values.table2,
              column2: values.column2,
            }
          } : {
            start: {
              mergeType: 'Single Table',
              table1: values.table1Single,
              column1: '',
              table2: '',
              column2: '',
            }
          })
        };

        const labelContent = createNodeLabel(
          tableName,
          nodeType,
          nodeData,
          currentEditNodeData.id,
          true
        );

        const newNode: Node = {
          id: currentEditNodeData.id,
          data: {
            ...nodeData,
            label: labelContent,
          },
          position: currentEditNodeData.position,
          draggable: true,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };

        setNodes((nds) => [...nds.filter(node => node.id !== currentEditNodeData.id), newNode]);
        setSelectedTable(tableName);
        setIsStartingNodeSaved(true);
        hideModal('isStartModalVisible');
        setSidebarItems((items) => items.map((item) => (item.id !== 'startingnode' ? { ...item, enabled: true } : item)));
      }
    },
    [currentEditNodeData, setNodes, setSidebarItems, hideModal]
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
        hideModal('isOutputModalVisible');
      }
    },
    [currentEditNodeData, setNodes, hideModal]
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
        hideModal('isPivotTableModalVisible');
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes, hideModal]
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
        hideModal('isGroupByModalVisible');
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes, hideModal]
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
        hideModal('isConditionalModalVisible');
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes, setEdges, hideModal]
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
        hideModal('isSortModalVisible');
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes, hideModal]
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
        hideModal('isFilterModalVisible');
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes, hideModal]
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
        hideModal('isStatisticalModalVisible');
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes, hideModal]
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
        hideModal('isScalingModalVisible');
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes, hideModal]
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
        hideModal('isArithmeticModalVisible');
      } else {
        console.error('Selected table is null');
      }
    },
    [currentEditNodeData, selectedTable, setNodes, hideModal]
  );

  const handleModalOk = useCallback(
    (values: any, modalType: string) => {
      switch (modalType) {
        case 'StartModal':
          handleStartModalOk(values);
          break;
        case 'OutputModal':
          handleOutputModalOk(values);
          break;
        case 'PivotTableModal':
          handlePivotTableModalOk(values);
          break;
        case 'GroupByModal':
          handleGroupByModalOk(values);
          break;
        case 'ConditionalModal':
          handleConditionalModalOk(values);
          break;
        case 'SortModal':
          handleSortModalOk(values);
          break;
        case 'FilterModal':
          handleFilterModalOk(values);
          break;
        case 'StatisticalModal':
          handleStatisticalModalOk(values);
          break;
        case 'ScalingModal':
          handleScalingModalOk(values);
          break;
        case 'ArithmeticModal':
          handleArithmeticModalOk(values);
          break;
        default:
          console.error('Unknown modal type:', modalType);
      }
    },
    [
      handleStartModalOk,
      handleOutputModalOk,
      handlePivotTableModalOk,
      handleGroupByModalOk,
      handleConditionalModalOk,
      handleSortModalOk,
      handleFilterModalOk,
      handleStatisticalModalOk,
      handleScalingModalOk,
      handleArithmeticModalOk,
    ]
  );

  const handleEdit = useCallback(
    (nodeId: string) => {
      const nodeToEdit = nodes.find((node) => node.id === nodeId);
      if (nodeToEdit) {
        const { type, ...nodeData } = nodeToEdit.data;
        setCurrentEditNodeData({
          id: nodeId,
          position: nodeToEdit.position,
          icon: 'FaEdit' as IconNames,
          ...nodeData,
        });

        switch (type) {
          case 'filter':
            showModal('isFilterModalVisible');
            break;
          case 'sort':
            showModal('isSortModalVisible');
            break;
          case 'if/else/and/or':
            showModal('isConditionalModalVisible');
            break;
          case 'groupby':
            showModal('isGroupByModalVisible');
            break;
          case 'statistical':
            showModal('isStatisticalModalVisible');
            break;
          case 'scaling':
            showModal('isScalingModalVisible');
            break;
          case 'arithmetic':
            showModal('isArithmeticModalVisible');
            break;
          case 'pivot':
            showModal('isPivotTableModalVisible');
            break;
          case 'output':
            showModal('isOutputModalVisible');
            break;
          case 'startingnode':
            showModal('isStartModalVisible');
            break;
          default:
            console.error('Unknown node type:', type);
        }
      } else {
        console.error('Node not found:', nodeId);
      }
    },
    [nodes, showModal]
  );

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
          return nds.filter((node) => node.id !== nodeId);
        }
        return nds;
      });
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  const createNodeLabel = (table: string, nodeType: string, data?: NodeData, nodeId?: string, isStartingPoint?: boolean, isEndingPoint?: boolean, hasOutput?: boolean) => {
    const renderData = (key: string, value: unknown) => {
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          return value.map((v, index) => (
            <div key={`${key}-${index}`}>
              {renderData(key, v)}
            </div>
          ));
        } else {
          return (
            <>
              {Object.entries(value).map(([subKey, subValue]) => (
                <p key={subKey} className={styles['subkeyvalue']}>
                  {subKey}: <b>{renderData(subKey, subValue)}</b>
                </p>
              ))}
            </>
          );
        }
      }
      return String(value);
    };

    const details = Object.entries(data || {})
      .filter(([key, value]) => {
        if (!value) return false;
        if (['table', 'type', 'label', 'hasOutput'].includes(key)) return false;
        if (nodeType === 'mergeTable' && ['mergeType', 'table1', 'column1', 'table2', 'column2'].includes(key)) return false;
        return true;
      })
      .map(([key, value]) => (
        <span key={key}>
          {renderData(key, value)}
        </span>
      ));


    return (
      <>
        {(isStartingPoint || nodeType === 'startingnode') && (
          <div className={styles['starting-point-label']}>
            STARTING POINT
          </div>
        )}
        {isEndingPoint && (
          <div className={styles['starting-point-label']}>
            ENDING POINT
          </div>
        )}
        {hasOutput && (
          <div className={styles['starting-output-label']}>
            PREVIEW OUTPUT
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
                    ...(hasOutput ? [{ label: 'Preview Output', key: '2' }] : []),
                  ]
                }}
                trigger={['click']}
              >
                <a onClick={(e) => e.preventDefault()} className='iconFont'>
                  <FiMoreHorizontal />
                </a>
              </Dropdown>
            </div>
            {nodeType !== 'Else Node' && data && nodeType !== 'table' && (
              <div className={`${styles.filterStyle}`}>

                {isRunClicked && nodeType !== 'mergeTable' && details}

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
                {nodeType === 'mergeTable' && 'merge' in data && data.merge && (
                  <>
                    <p>Table 1: <b>{data.merge.table1}</b></p>
                    <p>Column 1: <b>{data.merge.column1}</b></p>
                    <p>Merge Type: <b>{data.merge.mergeType}</b></p>
                    <p>Table 2: <b>{data.merge.table2}</b></p>
                    <p>Column 2: <b>{data.merge.column2}</b></p>
                  </>
                )}
                {nodeType === 'table' && 'start' in data && data.start && (
                  <>
                    <p>Table 1: <b>{data.start.table1}</b></p>
                    <p>Merge Type: <b>{data.start.mergeType}</b></p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };


  useEffect(() => {
    if (workflowOutput && typeof workflowOutput === 'object') {
      const allOutputIds = Object.keys(workflowOutput).flatMap(ruleKey =>
        Object.keys(workflowOutput[ruleKey] || {})
      );
      const uniqueOutputIds = Array.from(new Set(allOutputIds));
      setOutputNodeIds(uniqueOutputIds);

      setNodes((currentNodes) => {
        return currentNodes.map((node) => {
          const nodeData = node.data;
          const hasOutput = uniqueOutputIds.includes(node.id);

          return {
            ...node,
            data: {
              ...nodeData,
              hasOutput,
              label: createNodeLabel(
                nodeData.table || '',
                nodeData.type || 'Unknown',
                nodeData,
                node.id,
                nodeData.type === 'startingnode',
                nodeData.type === 'output',
                hasOutput
              ),
            },
          };
        });
      });
    }
  }, [workflowOutput, setNodes, setOutputNodeIds]);

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

      if (!isStartingNodeSaved && itemData.title !== 'Starting Node') {
        message.error('Please add a Starting Node first.');
        return;
      }

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

      const modalKey = modalKeyMap[itemData.title];
      if (modalKey) {
        showModal(modalKey);
        setCurrentEditNodeData({
          id,
          position,
          icon: itemData.icon as keyof typeof Icons | keyof typeof FaIcons,
        });
      } else {
        console.error('Unknown modal type for item title:', itemData.title);
      }
    },
    [nodes, screenToFlowPosition, setNodes, showModal, isStartingNodeSaved]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedTable(null);
    setModalVisibility({
      isStartModalVisible: false,
      isOutputModalVisible: false,
      isFilterModalVisible: false,
      isSortModalVisible: false,
      isConditionalModalVisible: false,
      isGroupByModalVisible: false,
      isStatisticalModalVisible: false,
      isScalingModalVisible: false,
      isArithmeticModalVisible: false,
      isPivotTableModalVisible: false,
    });
  }, []);

  return (
    <>
      <div className={styles['home-container']} onDrop={handleDrop} onDragOver={handleDragOver}>
        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              showOutputLabel: outputNodeIds.includes(node.id),
            },
            draggable: isStartingNodeSaved || node.data.type === 'startingnode',
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
        >
          <Controls />
          <Background color="#5C5E64" gap={12} />
        </ReactFlow>

        <WorkflowModals
          currentEditNodeData={currentEditNodeData}
          modalVisibility={modalVisibility}
          handleModalOk={handleModalOk}
          handleCancel={handleCancel}
          setSelectedTable={setSelectedTable}
          workspaces={workspaces}
          folders={folders}
          selectedWorkspace={selectedWorkspace}
          email={email}
        />
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
