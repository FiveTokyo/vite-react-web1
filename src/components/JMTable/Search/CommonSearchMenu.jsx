import { Card, Select, message } from 'antd';
import { useContext, useState } from 'react';
import { JMTableContext } from '..';

const CommonSearchMenu = (props) => {
  const { saveKey, setCommonSearchCols: setSearchCols } =
    useContext(JMTableContext);

  const { options } = props;
  const savePath = `${saveKey}_commonSearch`;

  const [selectValue, setSelectValue] = useState(() => {
    const item = localStorage.getItem(savePath);
    if (item) {
      return JSON.parse(item);
    }
  });

  if (!saveKey) return <></>;

  function onValueChange(v) {
    setSelectValue(v);
  }

  function onSave() {
    if (!selectValue) {
      message.error('请选择常用菜单');
      return;
    }
    if (selectValue?.length === 0) {
      localStorage.removeItem(savePath);
    } else {
      localStorage.setItem(savePath, JSON.stringify(selectValue));
    }
    message.success('保存成功');
    setSearchCols({
      label: savePath,
      value: selectValue,
    });
  }

  return (
    <Card
      title="常用搜索"
      style={{ marginTop: 10 }}
      headStyle={{ padding: 0, paddingLeft: 12 }}
      bodyStyle={{ background: '#f2f4f6', padding: '0' }}
      extra={
        <a style={{ marginRight: 15 }} onClick={onSave}>
          保存
        </a>
      }
    >
      <Select
        value={selectValue}
        onChange={onValueChange}
        showSearch={true}
        optionFilterProp="label"
        options={options}
        style={{ width: '100%' }}
        showArrow
        allowClear
        mode="multiple"
        placeholder="请选择常用搜索选项"
      />
    </Card>
  );
};

export default CommonSearchMenu;
