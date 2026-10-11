resource "azurerm_role_assignment" "blob_access" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Contributor"

  principal_id = azurerm_linux_virtual_machine.app.identity[0].principal_id
}
