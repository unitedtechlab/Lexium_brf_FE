import React from 'react';
import dynamic from 'next/dynamic';
import { XYPosition } from 'reactflow';
import {
    Condition,
    Conditional,
    Filter,
    Sort,
    GroupBy,
    Statistical,
    Scaling,
    Arithmetic,
    Merge,
    CustomNode,
    NodeData,
    PivotTableData,
    RuleData,
} from '../../types/workflowTypes';
import * as Icons from 'react-icons/sl';
import * as FaIcons from 'react-icons/fa';

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

interface WorkflowModalsProps {
    currentEditNodeData: {
        id: string;
        position: XYPosition;
        icon: keyof typeof Icons | keyof typeof FaIcons;
        pivotTable?: any;
    } | null;
    modalVisibility: {
        isStartModalVisible: boolean;
        isOutputModalVisible: boolean;
        isFilterModalVisible: boolean;
        isSortModalVisible: boolean;
        isConditionalModalVisible: boolean;
        isGroupByModalVisible: boolean;
        isStatisticalModalVisible: boolean;
        isScalingModalVisible: boolean;
        isArithmeticModalVisible: boolean;
        isPivotTableModalVisible: boolean;
    };
    handleModalOk: (values: any, modalType: string) => void;
    handleCancel: () => void;
    setSelectedTable: React.Dispatch<React.SetStateAction<string | null>>;
    workspaces: any[];
    folders: any[];
    selectedWorkspace: string | null;
    email: string | null;
}

const WorkflowModals: React.FC<WorkflowModalsProps> = ({
    currentEditNodeData,
    modalVisibility,
    handleModalOk,
    handleCancel,
    setSelectedTable,
    workspaces,
    folders,
    selectedWorkspace,
    email,
}) => {
    const commonProps = {
        handleCancel,
        setSelectedTable,
        workspaces,
        folders,
        selectedWorkspace,
        email: email || '', // Default to an empty string if email is null
    };

    return (
        <>
            <StartModal
                isModalVisible={modalVisibility.isStartModalVisible}
                handleOkay={(values) => handleModalOk(values, 'StartModal')}
                {...commonProps}
            />
            <OutputModal
                isModalVisible={modalVisibility.isOutputModalVisible}
                handleOkay={(values) => handleModalOk(values, 'OutputModal')}
                {...commonProps}
            />
            <FilterModal
                isModalVisible={modalVisibility.isFilterModalVisible}
                handleOkay={(values) => handleModalOk(values, 'FilterModal')}
                initialValues={currentEditNodeData}
                {...commonProps}
            />
            <SortModal
                isModalVisible={modalVisibility.isSortModalVisible}
                handleOkay={(values) => handleModalOk(values, 'SortModal')}
                {...commonProps}
            />
            <ConditionalModal
                isModalVisible={modalVisibility.isConditionalModalVisible}
                handleOkay={(values) => handleModalOk(values, 'ConditionalModal')}
                {...commonProps}
            />
            <GroupByModal
                isModalVisible={modalVisibility.isGroupByModalVisible}
                handleOk={(values) => handleModalOk(values, 'GroupByModal')}
                {...commonProps}
            />
            <StatisticalModal
                isModalVisible={modalVisibility.isStatisticalModalVisible}
                handleOkay={(values) => handleModalOk(values, 'StatisticalModal')}
                {...commonProps}
            />
            <ScalingModal
                isModalVisible={modalVisibility.isScalingModalVisible}
                handleOkay={(values) => handleModalOk(values, 'ScalingModal')}
                {...commonProps}
            />
            <ArithmeticModal
                isModalVisible={modalVisibility.isArithmeticModalVisible}
                handleOkay={(values) => handleModalOk(values, 'ArithmeticModal')}
                {...commonProps}
            />
            <PivotTable
                isModalVisible={modalVisibility.isPivotTableModalVisible}
                handleOk={(values) => handleModalOk(values, 'PivotTableModal')}
                initialValues={currentEditNodeData?.pivotTable}
                {...commonProps}
            />
        </>
    );
};

export default WorkflowModals;
