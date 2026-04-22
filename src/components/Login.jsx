import React, { useState } from 'react';
import { Form, Input, Button, Alert, Card, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined, SafetyOutlined } from '@ant-design/icons';
import { login } from '../services/LoginService';

const { Title, Text } = Typography;

const Login = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const onFinish = async (values) => {
    const { username, password } = values;
    setLoading(true);
    setError('');
    
    try {
      const response = await login(username, password);
      setLoading(false);
      
      if (response.success) {
        if (onLoginSuccess) {
          onLoginSuccess(response);
        }
      } else {
        setError('Error de inicio de sesión: ' + response.message);
      }
    } catch (error) {
      setLoading(false);
      setError('Credenciales inválidas. Intenta de nuevo.');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #001529 0%, #003a70 50%, #0050b3 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'rgba(24, 144, 255, 0.08)',
        top: -100,
        right: -100,
      }} />
      <div style={{
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'rgba(24, 144, 255, 0.06)',
        bottom: -50,
        left: -50,
      }} />

      <Card 
        style={{ 
          width: 420, 
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.97)',
        }}
        bodyStyle={{ padding: '40px 36px' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 14px rgba(24, 144, 255, 0.4)',
          }}>
            <BankOutlined style={{ fontSize: 28, color: 'white' }} />
          </div>
          <Title level={3} style={{ margin: '0 0 4px', color: '#001529' }}>
            Sistema de Auditoría
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            <SafetyOutlined /> Evaluación de Riesgos ISO 27001
          </Text>
        </div>
        
        {error && (
          <Alert 
            message={error} 
            type="error" 
            showIcon 
            style={{ marginBottom: 20, borderRadius: 6 }} 
            closable
            onClose={() => setError('')}
          />
        )}
        
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Ingresa tu usuario' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#1890ff' }} />} 
              placeholder="Usuario" 
              style={{ borderRadius: 6, height: 46 }}
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="Contraseña"
              style={{ borderRadius: 6, height: 46 }}
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              style={{
                height: 46,
                borderRadius: 6,
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                fontWeight: 600,
                fontSize: 15,
                boxShadow: '0 4px 14px rgba(24, 144, 255, 0.35)',
              }}
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </Button>
          </Form.Item>
          
          <div style={{ 
            textAlign: 'center', 
            background: '#f6f8fa', 
            padding: '12px 16px',
            borderRadius: 6,
            border: '1px dashed #d9d9d9',
          }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <strong>Credenciales de demo:</strong>
              <br />
              Usuario: <Text code>admin</Text> — Contraseña: <Text code>123456</Text>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
