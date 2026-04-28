'use client';

import { useState } from 'react';
import { Button, Card, Form, Input, Select, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth, usersService } from '@etnos/tools';
import type { SendNotificationPayload } from '@etnos/types';
import {
  useNotificacoes,
  type NotificationTargetType,
} from '../../@contexts/NotificacoesContext';

export const SendNotificationForm = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.includes('admin');
  const [userSearch, setUserSearch] = useState('');

  const {
    sendForm,
    schoolOptions,
    selectedTargetType,
    setSelectedTargetType,
    setPreviewModalOpen,
    isSending,
    onSend,
  } = useNotificacoes();

  const { data: users = [], isFetching: isFetchingUsers } = useQuery({
    queryKey: ['users', 'search', userSearch, 'push'],
    queryFn: () => usersService.getAll({ search: userSearch, hasPushToken: true }),
    enabled: selectedTargetType === 'INDIVIDUAL' && userSearch.length >= 2,
  });

  const userOptions = users.map((u) => ({
    value: u.id,
    label: u.childName || u.email || u.id,
  }));

  const targetTypeOptions = [
    ...(isAdmin ? [{ value: 'GLOBAL', label: 'Todos os usuários (Global)' }] : []),
    { value: 'SCHOOL', label: 'Escola específica' },
    ...(isAdmin ? [{ value: 'INDIVIDUAL', label: 'Usuário individual (Preview)' }] : []),
  ];

  const handleFinish = (values: {
    title: string;
    message: string;
    targetType: NotificationTargetType;
    schoolId?: string;
    userId?: string;
  }) => {
    if (isSending) return;

    const payload: SendNotificationPayload = {
      title: values.title,
      message: values.message,
      targetType: values.targetType,
      ...(values.schoolId ? { schoolId: values.schoolId } : {}),
      ...(values.userId ? { userId: values.userId } : {}),
    };

    onSend(payload);
  };

  const handlePreview = () => {
    const values = sendForm.getFieldsValue() as { title?: string; message?: string };
    if (!values.title || !values.message) {
      void message.warning('Preencha o título e a mensagem antes do preview.');
      return;
    }
    setPreviewModalOpen(true);
  };

  return (
    <Card title="Compor notificação">
      <Form
        form={sendForm}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ targetType: isAdmin ? 'GLOBAL' : 'SCHOOL' }}
      >
        <Form.Item
          name="title"
          label="Título"
          rules={[
            { required: true, message: 'Informe o título.' },
            { max: 255, message: 'Máximo 255 caracteres.' },
          ]}
        >
          <Input placeholder="Ex.: Novo desafio disponível!" />
        </Form.Item>

        <Form.Item
          name="message"
          label="Mensagem"
          rules={[{ required: true, message: 'Informe a mensagem.' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Ex.: Entre no app e confira o novo desafio."
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item name="targetType" label="Público alvo" rules={[{ required: true }]}>
          <Select
            options={targetTypeOptions}
            onChange={(v) => setSelectedTargetType(v as NotificationTargetType)}
          />
        </Form.Item>

        {selectedTargetType === 'SCHOOL' && (
          <Form.Item
            name="schoolId"
            label="Escola"
            rules={[{ required: true, message: 'Selecione uma escola.' }]}
          >
            <Select
              placeholder="Selecione a escola"
              options={schoolOptions}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        )}

        {selectedTargetType === 'INDIVIDUAL' && (
          <Form.Item
            name="userId"
            label="Usuário"
            rules={[{ required: true, message: 'Selecione um usuário.' }]}
          >
            <Select
              placeholder="Digite o nome ou e-mail para buscar"
              options={userOptions}
              showSearch
              filterOption={false}
              onSearch={setUserSearch}
              loading={isFetchingUsers}
              notFoundContent={
                userSearch.length < 2
                  ? 'Digite pelo menos 2 caracteres'
                  : isFetchingUsers
                    ? 'Buscando...'
                    : 'Nenhum usuário encontrado'
              }
            />
          </Form.Item>
        )}

        <div className="flex gap-2">
          <Button onClick={handlePreview} icon={<SendOutlined />}>
            Preview
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={isSending}
            block
          >
            Enviar notificação
          </Button>
        </div>
      </Form>
    </Card>
  );
};
