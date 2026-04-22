from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

# ==========================================
# MOTOR DE INTELIGENCIA ARTIFICIAL SIMULADO
# Base de conocimiento ISO 27001:2022 para
# evaluación de activos bancarios.
#
# Este motor reemplaza la conexión a Ollama
# y proporciona análisis de riesgos basados
# en perfiles predefinidos alineados con los
# controles del Anexo A de ISO 27001:2022.
# ==========================================

AI_ENGINE_NAME = "Motor de Análisis ISO 27001 v2.0"

RISK_DATABASE = {
    "servidor de base de datos": {
        "riesgos": [
            "Acceso no autorizado a datos sensibles",
            "Inyección SQL y explotación de vulnerabilidades",
            "Pérdida de datos por fallo de hardware",
            "Fuga de información confidencial de clientes",
            "Falta de cifrado en datos en reposo"
        ],
        "impactos": [
            "Exposición de información financiera de miles de clientes del banco, violando la Ley de Protección de Datos Personales",
            "Un atacante podría modificar, eliminar o extraer registros financieros críticos comprometiendo la integridad de las transacciones",
            "Interrupción total de los servicios bancarios con pérdida potencial de transacciones en curso y datos históricos",
            "Multas regulatorias, pérdida de confianza de clientes y daño reputacional significativo para la institución",
            "Incumplimiento del control A.8.24 de ISO 27001:2022 sobre uso de criptografía para protección de datos"
        ],
        "tratamientos": [
            "Implementar control de acceso basado en roles (RBAC) según ISO 27001 A.5.15, con autenticación multifactor para administradores de BD",
            "Aplicar validación de entradas, usar consultas parametrizadas y realizar pruebas de penetración trimestrales según A.8.28",
            "Configurar replicación en tiempo real y backups automatizados diarios con pruebas de restauración mensuales según A.8.13",
            "Implementar DLP (Data Loss Prevention) y cifrado AES-256 para datos sensibles según A.8.24",
            "Activar TDE (Transparent Data Encryption) y cifrado de columnas para datos PII según A.8.24 de ISO 27001"
        ],
        "probabilidad": "Alta"
    },
    "firewall perimetral": {
        "riesgos": [
            "Reglas de firewall mal configuradas o permisivas",
            "Falta de actualización del firmware",
            "Ausencia de monitoreo de tráfico en tiempo real",
            "Ataques DDoS que saturen el firewall",
            "Bypass de reglas mediante tunneling o protocolos no filtrados"
        ],
        "impactos": [
            "Acceso no autorizado a la red interna del banco permitiendo movimiento lateral de atacantes hacia sistemas críticos",
            "Explotación de vulnerabilidades conocidas del firmware que permitan tomar control total del dispositivo de seguridad",
            "Incapacidad para detectar intrusiones activas, permitiendo que un atacante opere sin ser detectado durante semanas",
            "Interrupción total de los servicios en línea del banco afectando a miles de clientes y operaciones diarias",
            "Evasión de controles de seguridad perimetral comprometiendo la primera línea de defensa de toda la infraestructura"
        ],
        "tratamientos": [
            "Realizar auditorías mensuales de reglas del firewall aplicando principio de mínimo privilegio según ISO 27001 A.8.20",
            "Establecer un programa de gestión de parches con actualizaciones críticas en 24h y regulares mensuales según A.8.8",
            "Implementar sistema SIEM integrado con el firewall para correlación de eventos en tiempo real según A.8.16",
            "Contratar servicio de mitigación DDoS y configurar rate limiting en el firewall según A.8.20",
            "Implementar inspección profunda de paquetes (DPI) y filtrado de protocolos según A.8.23"
        ],
        "probabilidad": "Alta"
    },
    "aplicación web de banca": {
        "riesgos": [
            "Vulnerabilidades XSS y CSRF en la interfaz web",
            "Autenticación débil o sesiones no seguras",
            "Exposición de APIs sin protección adecuada",
            "Inyección de código malicioso en formularios",
            "Falta de cifrado HTTPS en comunicaciones"
        ],
        "impactos": [
            "Robo de credenciales bancarias de clientes mediante scripts maliciosos inyectados en páginas legítimas del banco",
            "Suplantación de identidad de clientes permitiendo transferencias fraudulentas y acceso a información financiera",
            "Extracción masiva de datos de clientes a través de APIs expuestas comprometiendo la privacidad de miles de usuarios",
            "Manipulación de transacciones bancarias y formularios de transferencia provocando pérdidas económicas directas",
            "Interceptación de datos financieros en tránsito incluyendo números de cuenta, contraseñas y datos de tarjetas"
        ],
        "tratamientos": [
            "Implementar Content Security Policy (CSP), tokens anti-CSRF y sanitización de entradas según ISO 27001 A.8.28",
            "Configurar MFA obligatorio, tokens JWT con expiración corta y política de contraseñas robusta según A.5.17",
            "Implementar API Gateway con rate limiting, autenticación OAuth 2.0 y validación de esquemas según A.8.26",
            "Aplicar WAF (Web Application Firewall) y validación del lado servidor para todos los inputs según A.8.28",
            "Forzar HTTPS con HSTS, certificados TLS 1.3 y configurar perfect forward secrecy según A.8.24"
        ],
        "probabilidad": "Alta"
    },
    "backup en nas": {
        "riesgos": [
            "Backups sin cifrado almacenados en la NAS",
            "Falta de pruebas de restauración periódicas",
            "Acceso no restringido al sistema de backups",
            "Ausencia de backups offsite o en la nube",
            "Ransomware que cifre los backups en la NAS"
        ],
        "impactos": [
            "Exposición de datos bancarios históricos si un atacante accede a los backups sin cifrar en la NAS",
            "Imposibilidad de recuperar datos críticos ante un desastre, causando pérdida permanente de información financiera",
            "Personal no autorizado podría acceder, copiar o modificar respaldos conteniendo información sensible de clientes",
            "Pérdida total de datos ante un desastre físico en las instalaciones sin copia de respaldo externa",
            "Cifrado malicioso de todos los respaldos inutilizando la estrategia de recuperación ante desastres del banco"
        ],
        "tratamientos": [
            "Cifrar todos los backups con AES-256 antes de almacenarlos y gestionar claves de forma segura según ISO 27001 A.8.24",
            "Programar pruebas de restauración mensuales documentadas y simulacros de recuperación trimestrales según A.8.13",
            "Implementar control de acceso estricto a la NAS con autenticación MFA y registros de auditoría según A.5.15",
            "Configurar replicación 3-2-1 (3 copias, 2 medios, 1 offsite) con respaldo en nube según A.8.13",
            "Implementar backups inmutables (WORM) y segmentación de red para aislar la NAS según A.8.22"
        ],
        "probabilidad": "Media"
    },
    "contraseñas de usuarios": {
        "riesgos": [
            "Almacenamiento de contraseñas en texto plano",
            "Política de contraseñas débil o inexistente",
            "Reutilización de contraseñas entre sistemas",
            "Ataques de fuerza bruta sin bloqueo de cuenta",
            "Compartición de credenciales entre empleados"
        ],
        "impactos": [
            "Exposición masiva de credenciales de clientes y empleados si la base de datos es comprometida",
            "Facilidad para que atacantes adivinen contraseñas débiles accediendo a cuentas bancarias de clientes",
            "Compromiso en cascada de múltiples sistemas bancarios si una contraseña compartida es descubierta",
            "Acceso no autorizado a cuentas de clientes mediante ataques automatizados de fuerza bruta",
            "Violación de segregación de funciones y trazabilidad de acciones en sistemas críticos del banco"
        ],
        "tratamientos": [
            "Implementar hashing con bcrypt/Argon2 y salt único por usuario según ISO 27001 A.8.24",
            "Establecer política de contraseñas mínimo 12 caracteres, complejidad y rotación cada 90 días según A.5.17",
            "Implementar SSO con MFA y gestor de contraseñas corporativo para evitar reutilización según A.5.17",
            "Configurar bloqueo de cuenta tras 5 intentos fallidos y CAPTCHA progresivo según A.8.5",
            "Implementar cuentas nominales individuales con auditoría de acceso y prohibir cuentas compartidas según A.5.16"
        ],
        "probabilidad": "Alta"
    },
    "vpn corporativa": {
        "riesgos": [
            "Configuración VPN con protocolos obsoletos",
            "Falta de segmentación de acceso por perfil",
            "Credenciales VPN compartidas entre empleados",
            "Ausencia de monitoreo de conexiones VPN",
            "Split tunneling habilitado sin restricciones"
        ],
        "impactos": [
            "Interceptación del tráfico corporativo mediante ataques a protocolos débiles como PPTP o L2TP sin IPSec",
            "Usuarios con acceso VPN pueden alcanzar recursos no autorizados dentro de la red bancaria interna",
            "Imposibilidad de rastrear acciones maliciosas al no poder identificar qué empleado realizó cada conexión",
            "Conexiones no autorizadas o comprometidas pasan desapercibidas durante períodos prolongados",
            "El dispositivo remoto actúa como puente entre internet y la red corporativa exponiendo la infraestructura"
        ],
        "tratamientos": [
            "Migrar a protocolos modernos como WireGuard o IKEv2/IPSec con cifrado AES-256-GCM según ISO 27001 A.8.24",
            "Implementar Zero Trust Network Access (ZTNA) con acceso basado en roles y microsegmentación según A.8.22",
            "Emitir certificados digitales individuales y MFA para cada conexión VPN según A.5.17",
            "Integrar logs VPN con el SIEM corporativo para monitoreo y alertas en tiempo real según A.8.16",
            "Desactivar split tunneling y forzar todo el tráfico a través del túnel VPN según A.8.20"
        ],
        "probabilidad": "Media"
    },
    "api transacciones": {
        "riesgos": [
            "API sin autenticación o con tokens estáticos",
            "Ausencia de rate limiting y throttling",
            "Exposición de datos sensibles en respuestas API",
            "Falta de validación de parámetros de entrada",
            "Documentación API pública expone endpoints internos"
        ],
        "impactos": [
            "Acceso no autorizado a transacciones financieras permitiendo consultas y operaciones fraudulentas",
            "Ataques de denegación de servicio o abuso masivo de la API afectando la disponibilidad del servicio bancario",
            "Filtración de números de cuenta, montos y datos personales a través de respuestas API no sanitizadas",
            "Inyección de parámetros maliciosos que manipulen el procesamiento de transacciones bancarias",
            "Atacantes descubren y explotan endpoints internos no protegidos obteniendo acceso administrativo"
        ],
        "tratamientos": [
            "Implementar OAuth 2.0 con tokens JWT de corta duración y rotación automática según ISO 27001 A.8.26",
            "Configurar rate limiting por usuario/IP y throttling adaptativo según A.8.20",
            "Aplicar filtrado de campos sensibles en respuestas y enmascaramiento de datos PII según A.8.11",
            "Implementar validación estricta de esquemas con OpenAPI y sanitización de inputs según A.8.28",
            "Separar documentación interna de externa y restringir acceso a endpoints administrativos según A.8.3"
        ],
        "probabilidad": "Alta"
    },
    "plan de recuperación ante desastres": {
        "riesgos": [
            "Plan de recuperación desactualizado o inexistente",
            "Falta de pruebas y simulacros periódicos",
            "RTO y RPO no definidos para sistemas críticos",
            "Personal no capacitado en procedimientos de emergencia",
            "Dependencia de un único centro de datos"
        ],
        "impactos": [
            "Incapacidad de restaurar operaciones bancarias ante un desastre, causando pérdidas financieras millonarias",
            "Descubrimiento de fallos en el plan durante una emergencia real cuando ya es demasiado tarde para corregir",
            "Tiempo de recuperación impredecible que puede exceder los límites regulatorios y contractuales del banco",
            "Respuesta descoordinada ante incidentes que agrava el impacto y extiende el tiempo de inactividad",
            "Pérdida total de servicios sin capacidad de failover si el centro de datos principal queda inoperativo"
        ],
        "tratamientos": [
            "Actualizar el DRP semestralmente con revisión de todos los componentes críticos según ISO 27001 A.5.30",
            "Ejecutar simulacros de recuperación trimestrales con métricas documentadas según A.5.30",
            "Definir RTO máximo de 4h y RPO máximo de 1h para sistemas transaccionales críticos según A.5.30",
            "Programa de capacitación semestral con ejercicios de mesa (tabletop) para todo el personal clave según A.6.3",
            "Implementar centro de datos secundario activo-activo con failover automático según A.8.14"
        ],
        "probabilidad": "Media"
    }
}


def get_risk_analysis(activo):
    """
    Motor de IA para análisis de riesgos ISO 27001.
    Busca el activo en la base de conocimiento integrada
    y retorna riesgos e impactos contextualizados.
    """
    activo_lower = activo.lower().strip()
    for key, data in RISK_DATABASE.items():
        if key in activo_lower or activo_lower in key:
            return data["riesgos"], data["impactos"]
    # Genérico para activos no catalogados
    return [
        f"Acceso no autorizado al {activo}",
        f"Falta de monitoreo y registro de actividad en {activo}",
        f"Configuración insegura o por defecto en {activo}",
        f"Ausencia de respaldos para {activo}",
        f"Vulnerabilidades no parcheadas en {activo}"
    ], [
        f"Compromiso de datos sensibles procesados por {activo}",
        f"Imposibilidad de detectar incidentes de seguridad en {activo}",
        f"Explotación de configuraciones débiles en la infraestructura",
        f"Pérdida irreversible de información crítica del {activo}",
        f"Explotación de fallos conocidos en el entorno bancario"
    ]


def get_treatment(activo, riesgo, impacto):
    """
    Motor de IA para recomendación de tratamientos ISO 27001.
    Busca tratamientos específicos en la base de conocimiento.
    """
    activo_lower = activo.lower().strip()
    for key, data in RISK_DATABASE.items():
        if key in activo_lower or activo_lower in key:
            for i, r in enumerate(data["riesgos"]):
                if riesgo.lower() in r.lower() or r.lower() in riesgo.lower():
                    return data["tratamientos"][i]
            return data["tratamientos"][0]
    return f"Implementar controles según ISO 27001 Anexo A para mitigar '{riesgo}' en {activo}."


# ==========================================
# RUTAS DE LA APLICACIÓN
# ==========================================

@app.route('/', methods=["GET", 'POST'])
def serve_index():
    return send_from_directory('dist', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('dist', path)


# ==========================================
# ENDPOINT: Login ficticio sin base de datos
# ==========================================
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')
    if username == 'admin' and password == '123456':
        return jsonify({
            "success": True,
            "user": username,
            "token": "mock-jwt-token-banco-audit-2024",
            "role": "Auditor Externo"
        })
    return jsonify({"success": False, "message": "Credenciales inválidas"}), 401


# ==========================================
# ENDPOINT: Analizar riesgos de un activo
# ==========================================
@app.route('/analizar-riesgos', methods=['POST'])
def analizar_riesgos():
    try:
        data = request.get_json()
        activo = data.get('activo')
        if not activo:
            return jsonify({"error": "El campo 'activo' es necesario"}), 400
        # Simular procesamiento de IA
        time.sleep(0.5)
        riesgos, impactos = get_risk_analysis(activo)
        probabilidad = "Media"
        activo_lower = activo.lower().strip()
        for key, db_data in RISK_DATABASE.items():
            if key in activo_lower or activo_lower in key:
                probabilidad = db_data.get("probabilidad", "Media")
                break
        return jsonify({
            "activo": activo,
            "riesgos": riesgos,
            "impactos": impactos,
            "probabilidad": probabilidad,
            "motor": AI_ENGINE_NAME
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================================
# ENDPOINT: Sugerir tratamiento
# ==========================================
@app.route('/sugerir-tratamiento', methods=['POST'])
def sugerir_tratamiento():
    try:
        data = request.get_json()
        activo = data.get('activo')
        riesgo = data.get('riesgo')
        impacto = data.get('impacto')
        if not activo or not riesgo or not impacto:
            return jsonify({"error": "Campos 'activo', 'riesgo' e 'impacto' son necesarios"}), 400
        time.sleep(0.3)
        tratamiento = get_treatment(activo, riesgo, impacto)
        return jsonify({
            "activo": activo, "riesgo": riesgo,
            "impacto": impacto, "tratamiento": tratamiento,
            "motor": AI_ENGINE_NAME
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================================
# ENDPOINT: Evaluación completa de un activo
# ==========================================
@app.route('/evaluar-activo-completo', methods=['POST'])
def evaluar_activo_completo():
    try:
        data = request.get_json()
        activo = data.get('activo')
        if not activo:
            return jsonify({"error": "El campo 'activo' es necesario"}), 400
        time.sleep(0.5)
        riesgos, impactos = get_risk_analysis(activo)
        probabilidad = "Media"
        activo_lower = activo.lower().strip()
        for key, db_data in RISK_DATABASE.items():
            if key in activo_lower or activo_lower in key:
                probabilidad = db_data.get("probabilidad", "Media")
                break
        tratamientos = []
        for i, riesgo in enumerate(riesgos):
            imp = impactos[i] if i < len(impactos) else ""
            tratamientos.append(get_treatment(activo, riesgo, imp))
        return jsonify({
            "activo": activo, "riesgos": riesgos,
            "impactos": impactos, "tratamientos": tratamientos,
            "probabilidad": probabilidad, "motor": AI_ENGINE_NAME
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================================
# ENDPOINT: Estado del motor de IA
# ==========================================
@app.route('/api/ai-status', methods=['GET'])
def ai_status():
    return jsonify({
        "model": AI_ENGINE_NAME,
        "status": "Activo",
        "capabilities": [
            "Análisis de riesgos ISO 27001:2022",
            "Evaluación de impactos bancarios",
            "Recomendación de tratamientos",
            "Evaluación completa de activos"
        ]
    })


if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("  SISTEMA DE AUDITORÍA DE RIESGOS BANCARIOS")
    print(f"  Motor de IA: {AI_ENGINE_NAME}")
    print("=" * 50)
    print("  Servidor: http://localhost:5500")
    print("=" * 50 + "\n")
    app.run(debug=True, host="0.0.0.0", port=5500)