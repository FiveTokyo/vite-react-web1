import React, { useState } from 'react';
import { Button, ButtonProps } from 'antd';
import { debounce } from 'lodash-es';

interface LoadingButtonProps extends ButtonProps {
  // 点击按钮时触发的回调函数，需要返回 Promise<void>
  onClick: () => Promise<void>;
  // 防抖时间（毫秒）
  debounceTime?: number;
}

function JMLoadingButton(props: LoadingButtonProps) {
  const [loading, setLoading] = useState(false);

  // 使用 Lodash 的 debounce 函数创建防抖函数，限制按钮点击频率
  const handleClick = debounce(async () => {
    try {
      setLoading(true);
      await props.onClick();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, props.debounceTime ?? 300);

  return (
    <Button {...props} loading={loading} onClick={handleClick}>
      {props.children}
    </Button>
  );
}

export default JMLoadingButton;
