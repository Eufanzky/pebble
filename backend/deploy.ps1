# ================================
# CONFIG
# ================================
$RG = "pebble-rg"
$LOCATION = "swedencentral"
$PREFIX = "pebble$(Get-Random)"

# ================================
# LOGIN
# ================================
az login

# ================================
# RESOURCE GROUP
# ================================
az group create --name $RG --location $LOCATION

# ================================
# COSMOS DB
# ================================
$COSMOS_NAME = "$PREFIX-cosmos"

az cosmosdb create `
  --name $COSMOS_NAME `
  --resource-group $RG `
  --locations regionName=$LOCATION failoverPriority=0 `
  --kind GlobalDocumentDB

# ================================
# AZURE OPENAI
# ================================
$OPENAI_NAME = "$PREFIX-openai"

az cognitiveservices account create `
  --name $OPENAI_NAME `
  --resource-group $RG `
  --kind OpenAI `
  --sku S0 `
  --location $LOCATION

# ================================
# CONTENT SAFETY
# ================================
$CS_NAME = "$PREFIX-cs"

az cognitiveservices account create `
  --name $CS_NAME `
  --resource-group $RG `
  --kind ContentSafety `
  --sku S0 `
  --location $LOCATION

# ================================
# DOCUMENT INTELLIGENCE
# ================================
$DOC_NAME = "$PREFIX-docint"

az cognitiveservices account create `
  --name $DOC_NAME `
  --resource-group $RG `
  --kind FormRecognizer `
  --sku S0 `
  --location $LOCATION

# ================================
# STORAGE (BLOB)
# ================================
$STORAGE_NAME = ($PREFIX + "storage").ToLower()

az storage account create `
  --name $STORAGE_NAME `
  --resource-group $RG `
  --location $LOCATION `
  --sku Standard_LRS

# ================================
# AZURE AI SEARCH
# ================================
$SEARCH_NAME = ($PREFIX + "search").ToLower()

az search service create `
  --name $SEARCH_NAME `
  --resource-group $RG `
  --location $LOCATION `
  --sku basic

Write-Host "✅ Infraestructura creada"

#Obtener token de autenticacion para la API
#az account get-access-token --resource api://14b061ac-d0b7-4e07-af16-bc1acc8297dd