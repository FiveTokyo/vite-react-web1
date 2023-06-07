import { getLocal } from '@/utils/storage';
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload, message, Space } from 'antd';
import { UploadFile, UploadProps } from 'antd/es/upload';
import { useEffect, useState } from 'react';

interface UploadImageProps {
  value: string | string[]; // 图片 URL 或 URL 数组
  onChange?: (value: string[]) => void; // 回调函数
  readonly?: boolean; // 是否只读
  size?: { width: number; height: number }; // 图片尺寸
  uploadProps?: UploadProps;
}

/**
 * 自定义上传图片组件
 */
const UploadImage: React.FC<UploadImageProps> = (props) => {
  const {
    value,
    onChange,
    readonly,
    size = {
      width: 104,
      height: 72,
    },
    uploadProps,
  } = props;

  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const [previewStatus, setPreviewStatus] = useState<{
    visible: boolean;
    src: string;
  }>({
    visible: false,
    src: '',
  });

  useEffect(() => {
    let images: string[] = [];
    if (typeof value === 'string' && value.length > 0) {
      images = value.split(',');
    } else if (Array.isArray(value)) {
      images = value;
    }

    if (images.length === 0 || fileList.length !== 0) return;
    setFileList(
      images.map((d) => ({
        uid: `${Math.random()}`,
        name: 'image.png',
        status: 'done',
        url: d,
      }))
    );
  }, [value, fileList]);

  const handleChange = ({
    file,
    fileList: newFileList,
  }: {
    file: any;
    fileList: any[];
  }) => {
    if (file.status === 'removed') {
      onChange?.(newFileList.map((d) => d.url || d.response?.data?.url));
    } else if (file.status === 'done') {
      if (file.response?.code !== 1) {
        const msg = file.response?.msg;
        file.status = 'error';
        message.error(msg);
      } else {
        onChange?.(newFileList.map((d) => d.url || d.response?.data?.url));
      }
    } else if (file.status === 'error') {
      if (file.error?.status !== 1) {
        const msg =
          file.error?.status === 413 ? '上传失败，文件太大了。' : '上传失败';
        file.error = { ...file.error, message: msg };
        message.error(msg);
      }
    }
    setFileList(newFileList);
  };

  const handlePreview = (file: {
    url?: string;
    response?: { data?: { url?: string } };
  }) => {
    setPreviewStatus({
      visible: true,
      src: file.url || file.response?.data?.url || '',
    });
  };

  const uploadButton = (
    <div style={{ width: size.width, height: size.height }}>
      <PlusOutlined />
      <div>上传图片</div>
    </div>
  );

  if (readonly) {
    if (fileList?.length === 0) return <span>-</span>;
    return (
      <div>
        <Space wrap>
          {fileList?.map((d) => {
            return <Image width={70} height={70} key={d.uid} src={d.url} />;
          })}
        </Space>
      </div>
    );
  }

  return (
    <>
      <Upload.Dragger
        action={uploadProps?.action}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        maxCount={uploadProps?.maxCount || 9}
        multiple={true}
        name="upload"
        headers={{
          token: getLocal('token') || '',
        }}
        data={{
          filetype: 'image',
        }}
        style={{ width: size.width, height: size.height }}
        {...uploadProps}
      >
        {fileList.length >= 8 ? null : uploadButton}
      </Upload.Dragger>

      {/* 预览图 */}
      <Image
        width={200}
        style={{ display: 'none' }}
        src={previewStatus.src}
        preview={{
          ...previewStatus,
          onVisibleChange: (visible) => {
            setPreviewStatus({ visible, src: previewStatus.src });
          },
        }}
      />
    </>
  );
};

export default UploadImage;
