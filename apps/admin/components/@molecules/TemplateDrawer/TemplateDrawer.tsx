'use client';

import { Drawer } from 'antd';
import { FormTemplateNotification } from '../../@forms';


type TemplateDrawerProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  onClose: () => void;
  loading: boolean;
  onFinish: (values: { title: string; message: string }) => void;
  initialValues?: { title?: string; message?: string };
};

export const TemplateDrawer = ({
  open,
  title,
  submitLabel,
  onClose,
  loading,
  onFinish,
  initialValues,
}: TemplateDrawerProps) => (
  <Drawer open={open} title={title} onClose={onClose} destroyOnHidden>
    <FormTemplateNotification
      loading={loading}
      submitLabel={submitLabel}
      onFinish={onFinish}
      initialValues={initialValues}
    />
  </Drawer>
);
