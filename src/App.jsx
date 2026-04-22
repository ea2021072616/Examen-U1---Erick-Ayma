import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Form, Input, Popconfirm, Table, Modal, Layout, Typography, message, Tag, Card, Space, Tooltip, Badge, Select } from 'antd';
import { LogoutOutlined, UserOutlined, PlusOutlined, SafetyOutlined, RobotOutlined, BankOutlined, ThunderboltOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import Login from './components/Login';
import { isAuthenticated, logout } from './services/LoginService';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const EditableContext = React.createContext(null);

// ==========================================
// LISTA DE ACTIVOS BANCARIOS PREDEFINIDOS
// Para evaluación rápida según Anexo 1
// ==========================================
const ACTIVOS_BANCARIOS = [
  { value: "Servidor de base de datos", tipo: "Base de Datos" },
  { value: "API Transacciones", tipo: "Servicio Web" },
  { value: "Aplicación Web de Banca", tipo: "Aplicación" },
  { value: "Servidor de Correo", tipo: "Infraestructura" },
  { value: "Firewall Perimetral", tipo: "Seguridad" },
  { value: "Autenticación MFA", tipo: "Seguridad" },
  { value: "Registros de Auditoría", tipo: "Información" },
  { value: "Backup en NAS", tipo: "Almacenamiento" },
  { value: "Servidor DNS Interno", tipo: "Red" },
  { value: "Plataforma de Pagos Móviles", tipo: "Aplicación" },
  { value: "VPN Corporativa", tipo: "Infraestructura" },
  { value: "Red de Cajeros Automáticos", tipo: "Infraestructura" },
  { value: "CRM Bancario", tipo: "Aplicación" },
  { value: "Contraseñas de Usuarios", tipo: "Información" },
  { value: "Plan de Recuperación ante Desastres", tipo: "Documentación" },
];

// Editable Row Component
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

// Editable Cell Component
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} es requerido.` }]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
const App = () => {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('user') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [suggestEnabled, setSuggestEnabled] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [count, setCount] = useState(1);
  const [selectedActivo, setSelectedActivo] = useState('');
  const [customActivo, setCustomActivo] = useState('');
  const [aiStatus, setAiStatus] = useState(null);

  // Obtener estado de la IA al montar
  useEffect(() => {
    if (authenticated) {
      axios.get('/api/ai-status')
        .then(res => setAiStatus(res.data))
        .catch(() => setAiStatus({ status: 'Activo', model: 'Motor ISO 27001' }));
    }
  }, [authenticated]);

  const handleLoginSuccess = (response) => {
    setAuthenticated(true);
    setCurrentUser(response.user);
    message.success(`¡Bienvenido, ${response.user}! Sesión iniciada correctamente.`);
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setCurrentUser('');
    setDataSource([]);
    message.info('Sesión cerrada correctamente');
  };

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedActivo('');
    setCustomActivo('');
  };

  const handleDelete = (key) => {
    setDataSource(dataSource.filter((item) => item.key !== key));
  };

  // ==========================================
  // AGREGAR ACTIVO - Conecta con la IA del backend
  // ==========================================
  const handleOk = async () => {
    const activo = selectedActivo || customActivo;
    if (!activo.trim()) {
      message.error('Por favor selecciona o ingresa un nombre de activo');
      return;
    }

    setIsLoading(true);

    try {
      // Llamada real al backend (Motor de IA)
      const response = await axios.post('/analizar-riesgos', { activo });
      const { riesgos, impactos, probabilidad, motor } = response.data;

      // Crear una fila por cada riesgo identificado
      const newRows = riesgos.map((riesgo, index) => ({
        key: `${count + index}`,
        activo: index === 0 ? activo : '',
        riesgo,
        impacto: impactos[index] || '-',
        probabilidad: probabilidad || 'Media',
        tratamiento: '-',
      }));

      setDataSource([...dataSource, ...newRows]);
      setCount(count + riesgos.length);
      setIsModalVisible(false);
      setSuggestEnabled(true);
      setSelectedActivo('');
      setCustomActivo('');
      message.success(`✅ ${riesgos.length} riesgos identificados para "${activo}" [${motor}]`);
    } catch (error) {
      console.error('Error al analizar riesgos:', error);
      message.error('Error al conectar con el motor de IA. Verifica que el backend esté activo.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // RECOMENDAR TRATAMIENTOS - Conecta con la IA
  // ==========================================
  const handleRecommendTreatment = async () => {
    if (dataSource.length === 0) {
      message.warning('No hay riesgos para recomendar tratamientos');
      return;
    }

    setIsRecommending(true);

    try {
      const updatedData = [...dataSource];
      let currentActivo = '';

      for (let i = 0; i < updatedData.length; i++) {
        const item = updatedData[i];
        if (item.activo) currentActivo = item.activo;
        
        if (item.tratamiento === '-' || item.tratamiento === '') {
          try {
            const response = await axios.post('/sugerir-tratamiento', {
              activo: currentActivo,
              riesgo: item.riesgo,
              impacto: item.impacto,
            });
            updatedData[i] = { ...item, tratamiento: response.data.tratamiento };
          } catch (err) {
            console.error(`Error en tratamiento para ${item.riesgo}:`, err);
          }
        }
      }

      setDataSource(updatedData);
      message.success('✅ Tratamientos ISO 27001 generados por el motor de IA');
    } catch (error) {
      console.error('Error general:', error);
      message.error('Error al generar tratamientos');
    } finally {
      setIsRecommending(false);
    }
  };

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    newData.splice(index, 1, { ...newData[index], ...row });
    setDataSource(newData);
  };

  // ==========================================
  // COLUMNAS DE LA TABLA
  // ==========================================
  const defaultColumns = [
    {
      title: '🏦 Activo',
      dataIndex: 'activo',
      width: '12%',
      editable: true,
      render: (text) => text ? <Text strong style={{ color: '#1a3c5e' }}>{text}</Text> : null,
    },
    {
      title: '⚠️ Riesgo',
      dataIndex: 'riesgo',
      width: '18%',
      editable: true,
    },
    {
      title: '💥 Impacto',
      dataIndex: 'impacto',
      width: '25%',
      editable: true,
    },
    {
      title: '📊 Probabilidad',
      dataIndex: 'probabilidad',
      width: '10%',
      render: (prob) => {
        const colors = { 'Alta': 'red', 'Media': 'orange', 'Baja': 'green' };
        return <Tag color={colors[prob] || 'blue'}>{prob}</Tag>;
      },
    },
    {
      title: '🛡️ Tratamiento ISO 27001',
      dataIndex: 'tratamiento',
      width: '28%',
      editable: true,
      render: (text) => text === '-' ? <Text type="secondary" italic>Pendiente de análisis IA...</Text> : text,
    },
    {
      title: 'Acción',
      dataIndex: 'operation',
      width: '7%',
      render: (_, record) => (
        dataSource.length >= 1 ? (
          <Popconfirm title="¿Eliminar este registro?" onConfirm={() => handleDelete(record.key)}>
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Eliminar
            </Button>
          </Popconfirm>
        ) : null
      ),
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  // Si no está autenticado, mostrar Login
  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header */}
      <Header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #001529 0%, #003a70 100%)',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BankOutlined style={{ color: '#40a9ff', fontSize: 24 }} />
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            Sistema de Auditoría de Riesgos Bancarios
          </Title>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {aiStatus && (
            <Tooltip title={`Motor: ${aiStatus.model}`}>
              <Badge status="success" />
              <Text style={{ color: '#52c41a', marginLeft: 4, fontSize: 12 }}>
                <RobotOutlined /> IA Activa
              </Text>
            </Tooltip>
          )}
          <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
            <UserOutlined /> {currentUser}
          </Text>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: '#ff7875' }}
          >
            Salir
          </Button>
        </div>
      </Header>

      {/* Content */}
      <Content style={{ padding: '24px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {/* Info Card */}
        <Card
          style={{
            marginBottom: 20,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)',
            border: '1px solid #91d5ff',
          }}
          bodyStyle={{ padding: '16px 24px' }}
        >
          <Space size="large">
            <div>
              <Text strong style={{ fontSize: 16 }}>
                <SafetyOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                Auditoría ISO 27001:2022 — Entorno Bancario
              </Text>
              <br />
              <Text type="secondary">
                Evalúe activos de información, identifique riesgos y genere tratamientos alineados con el Anexo A de ISO 27001.
              </Text>
            </div>
            <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px' }}>
              <RobotOutlined /> {aiStatus?.model || 'Motor ISO 27001'}
            </Tag>
          </Space>
        </Card>

        {/* Action Buttons */}
        <Space style={{ marginBottom: 16 }}>
          <Button
            onClick={showModal}
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none',
              borderRadius: 6,
              height: 42,
            }}
          >
            Agregar Activo
          </Button>
          <Button
            onClick={handleRecommendTreatment}
            type="primary"
            loading={isRecommending}
            disabled={!suggestEnabled}
            icon={<ThunderboltOutlined />}
            size="large"
            style={{
              background: suggestEnabled
                ? 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
                : undefined,
              border: 'none',
              borderRadius: 6,
              height: 42,
            }}
          >
            🤖 Generar Tratamientos con IA
          </Button>
        </Space>

        {/* Modal Agregar Activo */}
        <Modal
          title={
            <span>
              <BankOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Agregar Activo de Información Bancario
            </span>
          }
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="🔍 Analizar con IA"
          cancelText="Cancelar"
          confirmLoading={isLoading}
          width={520}
        >
          <Form layout="vertical">
            <Form.Item label="Seleccionar activo predefinido (Anexo 1)">
              <Select
                placeholder="Selecciona un activo del catálogo bancario..."
                value={selectedActivo || undefined}
                onChange={(val) => { setSelectedActivo(val); setCustomActivo(''); }}
                allowClear
                showSearch
                optionFilterProp="children"
                size="large"
              >
                {ACTIVOS_BANCARIOS.map((a) => (
                  <Option key={a.value} value={a.value}>
                    {a.value} — <Text type="secondary">{a.tipo}</Text>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="O escribir activo personalizado">
              <Input
                value={customActivo}
                onChange={(e) => { setCustomActivo(e.target.value); setSelectedActivo(''); }}
                placeholder="Ej: Sistema SWIFT de transferencias internacionales"
                size="large"
                disabled={!!selectedActivo}
              />
            </Form.Item>
          </Form>
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '12px 0', color: '#1890ff' }}>
              <RobotOutlined spin style={{ fontSize: 20, marginRight: 8 }} />
              Analizando riesgos con el motor de IA ISO 27001...
            </div>
          )}
        </Modal>

        {/* Tabla de Riesgos */}
        <Card
          style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 20 }}
            locale={{ emptyText: '📋 Agrega un activo para comenzar la evaluación de riesgos' }}
            size="middle"
          />
        </Card>

        {dataSource.length > 0 && (
          <Card style={{ marginTop: 16, borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Text type="secondary">
              📊 Total de registros: <Text strong>{dataSource.length}</Text> | 
              Activos evaluados: <Text strong>{new Set(dataSource.filter(d => d.activo).map(d => d.activo)).size}</Text> | 
              Con tratamiento: <Text strong>{dataSource.filter(d => d.tratamiento !== '-').length}</Text>
            </Text>
          </Card>
        )}
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529', color: 'rgba(255,255,255,0.65)', padding: '16px' }}>
        Sistema de Auditoría de Riesgos Bancarios — ISO 27001:2022 ©{new Date().getFullYear()} |
        Desarrollado por Erick Yoel Ayma Choque
      </Footer>
    </Layout>
  );
};

export default App;
