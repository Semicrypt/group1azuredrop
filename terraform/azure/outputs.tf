output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "vm_public_ip" {
  value = azurerm_public_ip.vm.ip_address
}

output "storage_account_name" {
  value = azurerm_storage_account.main.name
}

output "blob_container_name" {
  value = azurerm_storage_container.files.name
}

output "postgres_host" {
  value = azurerm_postgresql_flexible_server.main.fqdn
}

output "vm_managed_identity_principal_id" {
  value = azurerm_linux_virtual_machine.app.identity[0].principal_id
}
