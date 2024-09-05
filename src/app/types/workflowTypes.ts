export interface Condition {
    id: string;
    type: string;
    column: string;
    condition: string;
    value: string;
    operator?: string;
    subConditions?: Condition[];
    outsideConditions?: Condition[];
}

export interface Conditional {
    conditionType: string;
    conditions: Condition[];
}

export interface Filter {
    column: string;
    operator: string;
    value: string;
}

export interface Sort {
    column: string;
    sortType: string;
}

export interface GroupBy {
    groupByColumns: string[];
    targetColumns?: string[];
    functionCheckboxes?: {
        [key: string]: string[];
    };
}

export interface Statistical {
    column: string;
    statisticalFunction: string;
}

export interface Scaling {
    column: string;
    scalingFunction: string;
    minValue?: string;
    maxValue?: string;
}

export interface Arithmetic {
    sourceColumn: string[];
    targetColumn?: string;
    targetvalue?: string;
    operation: string;
}

export interface Merge {
    mergeType: string;
    table1: string;
    column1: string;
    table2: string;
    column2: string;
}

export interface PivotTableData {
    pivotColumns: {
        index: string[];
        column: string[];
        value: string[];
    };
    functionCheckboxes: {
        [key: string]: string[];
    };
}

export interface RuleData {
    outputName: string;
}

export interface CustomNode {
    type: string;
    label?: React.ReactNode;
    table?: string;
    parentId?: string;
    pivotTable?: PivotTableData;
    filter?: Filter;
    sort?: Sort;
    conditional?: Conditional;
    groupby?: GroupBy;
    statistical?: Statistical;
    scaling?: Scaling;
    arithmetic?: Arithmetic;
    merge?: Merge;
    output?: RuleData;
    start?: {
        mergeType: string;
        table1: string;
        column1: string;
        table2: string;
        column2: string;
    };
}

export type NodeData =
    | Filter
    | Sort
    | Conditional
    | GroupBy
    | Statistical
    | Scaling
    | Arithmetic
    | PivotTableData
    | Merge
    | CustomNode;
