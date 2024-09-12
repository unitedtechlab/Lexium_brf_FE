import React from 'react';
import { useDnD } from '../DnDContext';
import styles from '@/app/assets/css/workflow.module.css';
import { Input, Select } from 'antd';
import { SiMonkeytype } from "react-icons/si";
import { PiMathOperationsBold } from "react-icons/pi";
import { TbMathXDivideY2, TbMathIntegralX, TbMathMaxMin } from "react-icons/tb";

const { Search } = Input;

const Sidebar: React.FC = () => {
  const { setType } = useDnD();

  const onDragStart = (event: React.DragEvent, nodeType: string, titleName: string) => {
    setType({ nodeType, titleName });
    event.dataTransfer.effectAllowed = 'move';
  };

  const IconComponent = ({ icon }: { icon: React.ReactElement }) => {
    return <span className={styles.icon}>{icon}</span>;
  };

  return (
    <aside>
      <div className={styles.sidebarWrapper}>
        <div className={styles.heading}>
          <h6>Tool Box</h6>
          <p>Click and drag a block to canvas to build a workflow</p>
        </div>

        <div className={styles.workspaceSelect}>
          <label htmlFor="selectworkspace">Select Workspace</label>
          <Select
            placeholder="Select Workspace"
            className="workspace_select"
            id="selectworkspace"
          >
            <Select.Option>Workspace 1</Select.Option>
          </Select>
        </div>

        <div className={styles.searchWrapper}>
          <Search placeholder="Search" className={styles.searchInput} />
        </div>

        <div className={styles.operations}>
          <h6>Arithmetic Operators</h6>

          {/* Constant / Variable Node */}
          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'constant', 'Constant / Variable')}
            draggable
          >
            <IconComponent icon={<SiMonkeytype />} />
            <h6 className={styles.titleName}>Constant / Variable</h6>
          </div>

          {/* Addition / Subtraction Node */}
          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'add_sub', 'Addition / Subtraction')}
            draggable
          >
            <IconComponent icon={<PiMathOperationsBold />} />
            <h6 className={styles.titleName}>Addition / Subtraction</h6>
          </div>

          {/* Multiplication / Division Node */}
          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'multiply_divide', 'Multiplication / Division')}
            draggable
          >
            <IconComponent icon={<TbMathXDivideY2 />} />
            <h6 className={styles.titleName}>Multiplication / Division</h6>
          </div>

          {/* Modifier Node */}
          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'modifier', 'Modifier Node')}
            draggable
          >
            <IconComponent icon={<TbMathIntegralX />} />
            <h6 className={styles.titleName}>Modifier</h6>
          </div>

          {/* Compiler Node */}
          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'compiler', 'Compiler Node')}
            draggable
          >
            <IconComponent icon={<TbMathMaxMin />} />
            <h6 className={styles.titleName}>Compiler</h6>
          </div>

        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
