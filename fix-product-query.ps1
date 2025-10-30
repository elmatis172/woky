# Script para agregar campos de dimensiones a la query del producto

$file = "C:\PAGINAWOKY\app\(store)\productos\[slug]\page.tsx"

Write-Host "Archivo: $file"
Write-Host "Existe: $(Test-Path -LiteralPath $file)"

$content = Get-Content -LiteralPath $file -Raw

# Buscar el patrón y reemplazarlo
$pattern = '(?s)const product = await db\.product\.findUnique\(\{.*?include: \{\s*category: true,\s*\},\s*\}\);'

$replacement = @'
const product = await db.product.findUnique({
    where: {
      slug,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sku: true,
      price: true,
      compareAtPrice: true,
      images: true,
      stock: true,
      attributes: true,
      weight: true,
      width: true,
      height: true,
      length: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
'@

$newContent = $content -replace $pattern, $replacement

Set-Content -LiteralPath $file $newContent

Write-Host "✅ Archivo actualizado"
