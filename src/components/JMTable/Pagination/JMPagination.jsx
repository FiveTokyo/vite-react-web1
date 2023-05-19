import { formatArrayToSelect } from '@/utils/common';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Input, Popover, Select, Space } from 'antd';
import { debounce } from 'lodash-es';
import { useEffect, useState } from 'react';

const JMPagination = (props) => {
  const {
    pageSizeOptions = [],
    pageSize = pageSizeOptions[0],
    current = 0,
    total = 0,
    onChange,
    getPopupContainer,
  } = props;

  const [page, setPage] = useState(current);
  const [pagesize, setPagesize] = useState(~~pageSize);

  useEffect(() => {
    setPage(~~current);
  }, [current]);

  useEffect(() => {
    setPagesize(~~pageSize);
  }, [pageSize]);

  const onPageSizeChange = (v) => {
    onChange(1, v);
  };

  const beforePageChange = () => {
    const p = page - 1;
    onChange(p, pagesize);
  };

  const afterPageChange = () => {
    const p = page + 1;
    onChange(p, pagesize);
  };

  const onJumpChange = (e) => {
    const value = e.target.value;
    onChange(value, pagesize);
  };

  const debounceJumpChange = debounce(onJumpChange, 500);

  const content = (
    <Space direction="vertical">
      <Space>
        <Select
          style={{ width: 113 }}
          value={pagesize}
          onChange={(v) => onPageSizeChange(v)}
          options={formatArrayToSelect(pageSizeOptions.map((d) => ~~d))}
        />
        <label>{'/页'}</label>
      </Space>
      <Space>
        <label>跳至</label>
        <Input style={{ width: 80 }} onChange={debounceJumpChange} />
        <label>页</label>
      </Space>
    </Space>
  );

  const allPage = Math.ceil(total / pagesize);
  return (
    <Space size={0}>
      <Popover
        overlayStyle={{ width: 180 }}
        content={content}
        trigger={['click']}
        placement="bottomRight"
        getPopupContainer={getPopupContainer}
      >
        <Button style={{ padding: '0 4px' }} type="text">
          共{total}条，{page}/{allPage}页
        </Button>
      </Popover>
      <Button
        type="text"
        icon={<LeftOutlined />}
        disabled={page == 1}
        onClick={() => beforePageChange()}
      />
      <Button
        type="text"
        icon={<RightOutlined />}
        disabled={page >= allPage}
        onClick={() => afterPageChange()}
      />
    </Space>
  );
};

export default JMPagination;
