resource "azurerm_private_dns_zone" "postgres" {
  name = "azuredrop.postgres.database.azure.com"

  resource_group_name = azurerm_resource_group.main.name

  tags = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name = "${var.project_name}-postgres-link"

  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  virtual_network_id    = azurerm_virtual_network.main.id

  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_postgresql_flexible_server" "main" {
  name = "${var.project_name}-postgres"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  version = "16"

  administrator_login    = var.postgres_admin_username
  administrator_password = var.postgres_admin_password

  delegated_subnet_id = azurerm_subnet.database.id
  private_dns_zone_id = azurerm_private_dns_zone.postgres.id

  public_network_access_enabled = false

  storage_mb = 32768
  sku_name   = "B_Standard_B1ms"

  backup_retention_days = 7

  depends_on = [
    azurerm_private_dns_zone_virtual_network_link.postgres
  ]

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server_database" "app" {
  name      = "azuredrop"
  server_id = azurerm_postgresql_flexible_server.main.id

  charset   = "UTF8"
  collation = "en_US.utf8"
}
