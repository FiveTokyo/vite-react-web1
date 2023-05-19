import { Modal, ModalProps } from 'antd';
import { isBoolean } from 'lodash-es';
import { isValidElement } from 'react';
import { useEffect } from 'react';
import { useState, cloneElement, ReactNode, ReactElement } from 'react';

interface JMModalProps {
  trigger: ReactElement; // 触发器组件
  request?: () => void; // 请求函数
  children: ReactNode; // 内容组件
  modalProps?: ModalProps; // 模态框属性
  title?: string; // 标题
  width?: number; // 宽度
}

interface JMModalHandler {
  setVisible: React.Dispatch<React.SetStateAction<boolean>>; // 设置可见性
  visible: boolean; // 是否可见
}

/**
 * 自定义模态框组件
 */
const JMModal: React.FC<JMModalProps> = (props) => {
  const { trigger, request, children, modalProps = {}, title, width } = props;

  const [visible, setVisible] = useState(false); // 是否可见
  const [loading, setloading] = useState(false); // 是否正在加载

  useEffect(() => {
    if (visible) {
      request?.();
    }
  }, [visible, request]);

  const item = cloneElement(trigger, {
    onClick: () => {
      if (trigger?.props?.onClick) {
        const result = trigger?.props?.onClick();
        if (isBoolean(result)) {
          setVisible(result);
        } else if (result instanceof Promise) {
          result.then((res) => {
            setVisible(res);
          });
        } else {
          setVisible(true);
        }
      } else {
        setVisible(true);
      }
    },
  });

  if (!visible) {
    return item;
  }

  async function hangleOnOk(e: any) {
    try {
      setloading(true);
      const res = await modalProps.onOk?.(e) as any;
      setVisible(!!res);
    } finally {
      setloading(false);
    }
  }

  function hangleOnCancel(e: any) {
    setVisible(modalProps.onCancel ? modalProps.onCancel(e) as any : false);
  }

  const content = isValidElement(children)
    ? cloneElement(children, {
        onClose: () => setVisible(false),
      } as any)
    : children;

  return (
    <>
      {item}
      <Modal
        confirmLoading={loading}
        title={title || '标题'}
        width={width || 800}
        open={visible} // 修改了属性名称
        maskClosable
        bodyStyle={{ paddingTop: 0, maxHeight: '70vh', overflow: 'auto' }}
        {...modalProps}
        onOk={hangleOnOk}
        onCancel={hangleOnCancel}
      >
        {content}
      </Modal>
    </>
  );
};

export default JMModal;
