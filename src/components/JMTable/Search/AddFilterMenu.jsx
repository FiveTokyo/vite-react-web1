import { PlusOutlined } from '@ant-design/icons';
import { Button, Popover, Select } from 'antd';
import { useState } from 'react';

const AddFilterMenu = (props) => {
  const { menus = [], onSelect, type } = props;

  const [visible, setVisible] = useState(false);

  const options = menus.map((d) => ({
    label: typeof d.title === 'function' ? d.title() : d.title,
    value: d.dataIndex,
  }));

  const onValueChange = (v) => {
    onSelect?.(v);
    setVisible(false);
  };

  const onVisibleChange = (v) => {
    setVisible(v);
  };

  return (
    <Popover
      trigger="click"
      showArrow={false}
      open={visible}
      onOpenChange={onVisibleChange}
      placement="bottomLeft"
      destroyTooltipOnHide={true}
      getPopupContainer={() => document.querySelector(`#add-filter-button-${type}`)}
      content={
        <Select
          autoFocus
          defaultOpen
          onInputKeyDown={(e) => {
            if (e.code === 'Space') {
              e.preventDefault();
            }
          }}
          style={{ width: 300 }}
          placeholder="请选择筛选条件"
          showSearch={true}
          optionFilterProp="label"
          options={options}
          onSelect={onValueChange}
        />
      }
      zIndex={99999}
    >
      <Button
        id={`add-filter-button-${type}`}
        type="link"
        icon={<PlusOutlined />}
        onClick={() => setVisible(true)}
      >
        添加筛选条件
      </Button>
    </Popover>
  );
};

export default AddFilterMenu;
