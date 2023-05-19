import React, { useState, ReactNode } from 'react';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { Card, Space, Button, CardProps } from 'antd';

interface CardSwitchProps extends CardProps {
  // 额外显示在标题栏右侧的元素
  extra?: ReactNode;
}

const JMSwitchCard: React.FC<CardSwitchProps> = ({
  extra,
  children,
  ...other
}) => {
  const [open, setOpen] = useState(true);

  return (
    <Card
      {...other}
      extra={
        <Space>
          {extra}
          <Button size="small" type="link" onClick={() => setOpen(!open)}>
            {open ? '收起' : '展开'}
            {open ? <UpOutlined /> : <DownOutlined />}
          </Button>
        </Space>
      }
    >
      <div style={{ display: open ? 'block' : 'none' }}>{children}</div>
    </Card>
  );
};

export default JMSwitchCard;
