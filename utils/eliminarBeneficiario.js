const fs = require('fs');
const path = require('path');

const UPLOADS_ROOT = path.join(__dirname, '../routes/uploads');

function resolveUploadPath(storedPath) {
    if (!storedPath) return null;
    const rel = String(storedPath).replace(/^\/uploads\/?/, '').replace(/\\/g, '/');
    return path.join(UPLOADS_ROOT, rel);
}

function eliminarSiExiste(filePath) {
    if (!filePath || !fs.existsSync(filePath)) return;
    try {
        fs.unlinkSync(filePath);
    } catch (err) {
        console.warn('No se pudo borrar archivo:', filePath, err.message);
    }
}

function eliminarDirectorioSiExiste(dirPath) {
    if (!dirPath || !fs.existsSync(dirPath)) return;
    try {
        fs.rmSync(dirPath, { recursive: true, force: true });
    } catch (err) {
        console.warn('No se pudo borrar carpeta:', dirPath, err.message);
    }
}

function eliminarArchivosEnDisco(dni, solicitudes = []) {
    const solicitudesDir = path.join(UPLOADS_ROOT, 'solicitudes');
    const beneficiarioDir = path.join(UPLOADS_ROOT, 'beneficiario', String(dni));

    for (const sol of solicitudes) {
        eliminarSiExiste(resolveUploadPath(sol.path_dni));
        eliminarSiExiste(resolveUploadPath(sol.path_historial_medico));
    }

    if (fs.existsSync(solicitudesDir)) {
        const prefijo = `${dni}-`;
        for (const nombre of fs.readdirSync(solicitudesDir)) {
            if (nombre.startsWith(prefijo)) {
                eliminarSiExiste(path.join(solicitudesDir, nombre));
            }
        }
    }

    eliminarDirectorioSiExiste(beneficiarioDir);
}

/**
 * Borra beneficiario y datos relacionados por DNI. No toca la tabla `usuario`.
 */
async function eliminarBeneficiarioPorDni(db, dni) {
    const dniStr = String(dni || '').trim();
    if (!dniStr) {
        throw new Error('DNI inválido');
    }

    const [benRows] = await db.execute(
        'SELECT id FROM beneficiario WHERE dni = ? LIMIT 1',
        [dniStr]
    );
    const idBeneficiario = benRows.length > 0 ? benRows[0].id : null;

    const [solicitudes] = await db.execute(
        `SELECT path_dni, path_historial_medico FROM solicitud
         WHERE dni = ? OR (? IS NOT NULL AND id_beneficiario = ?)`,
        [dniStr, idBeneficiario, idBeneficiario]
    );

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        await conn.execute(
            `DELETE FROM historial_mov
             WHERE dni = ? OR (? IS NOT NULL AND id_beneficiario = ?)`,
            [dniStr, idBeneficiario, idBeneficiario]
        );

        await conn.execute(
            `DELETE FROM pariente
             WHERE dni_titular = ? OR (? IS NOT NULL AND id_beneficiario = ?)`,
            [dniStr, idBeneficiario, idBeneficiario]
        );

        await conn.execute('DELETE FROM pariente WHERE dni_pariente = ?', [dniStr]);

        await conn.execute(
            `DELETE FROM archivo_beneficiario
             WHERE dni = ? OR (? IS NOT NULL AND id_beneficiario = ?)`,
            [dniStr, idBeneficiario, idBeneficiario]
        );

        await conn.execute(
            `DELETE FROM solicitud
             WHERE dni = ? OR (? IS NOT NULL AND id_beneficiario = ?)`,
            [dniStr, idBeneficiario, idBeneficiario]
        );

        await conn.execute(
            `DELETE FROM tarjeta_soc
             WHERE dni = ? OR (? IS NOT NULL AND id_beneficiario = ?)`,
            [dniStr, idBeneficiario, idBeneficiario]
        );

        await conn.execute('DELETE FROM beneficiario WHERE dni = ?', [dniStr]);

        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }

    eliminarArchivosEnDisco(dniStr, solicitudes);

    return { dni: dniStr, id_beneficiario: idBeneficiario };
}

module.exports = { eliminarBeneficiarioPorDni };
