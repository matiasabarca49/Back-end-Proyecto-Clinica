#!/usr/bin/env node
import { Command } from 'commander';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importar el servicio
import UsersService from '../src/service/user.service.js';
const usersService = new UsersService()

dotenv.config();

const program = new Command();

program
  .name('create-admin')
  .description('Crear usuario administrador del sistema')
  .requiredOption('-e, --email <email>', 'Email del administrador')
  .requiredOption('-p, --password <password>', 'Contraseña del administrador')
  .requiredOption('-n, --name <name>', 'Nombre completo', 'Administrador')
  .action(async (options) => {
    try {
      // Conectar a la base de datos
      await mongoose.connect(process.env.DATABASE_URL);
      console.log('✓ Conectado a la base de datos');

      // Verificar que no existan otros admins (opcional)
      const existingAdmins = await userService.searchUser({rol: 'admin'});
      if (existingAdmins.length > 0) {
        console.error('⚠️  Ya existe un administrador en el sistema');
        console.log('Usa la interfaz web para crear más administradores\n');
        await mongoose.connection.close();
        process.exit(1);
      }

     let admin = {
        email: options.email,
        password: options.password,
        name: options.name,
        rol: 'admin'
      }

      // Crear el admin usando el servicio
      admin = await usersService.create(admin);

      console.log('\n✓ Usuario administrador creado exitosamente');
      console.log('━'.repeat(50));
      console.log(`Email: ${admin.email}`);
      console.log(`Nombre: ${admin.name}`);
      console.log(`Rol: ${admin.rol}`);
      console.log('━'.repeat(50));
      console.log('\n⚠️  Guarda estas credenciales en un lugar seguro\n');

      await mongoose.connection.close();
      
      process.exit(0);

    } catch (error) {
        console.log(error)
        console.error('❌ Error al crear administrador:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
  });

program.parse();