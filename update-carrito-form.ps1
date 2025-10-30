# Script para actualizar el formulario de provincia y ciudad
$file = "c:\PAGINAWOKY\app\(store)\carrito\page.tsx"
$content = Get-Content $file -Raw

# Patrón a buscar (la sección antigua)
$oldPattern = @'
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad \*</Label>
                    <Input
                      id="city"
                      value=\{shippingData\.city\}
                      onChange=\{\(e\) => setShippingData\(\{\.\.\.shippingData, city: e\.target\.value\}\)\}
                      placeholder="CABA"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Provincia \*</Label>
                    <Input
                      id="province"
                      value=\{shippingData\.province\}
                      onChange=\{\(e\) => setShippingData\(\{\.\.\.shippingData, province: e\.target\.value\}\)\}
                      placeholder="Buenos Aires"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Código Postal \*</Label>
                  <Input
                    id="postalCode"
                    value=\{shippingData\.postalCode\}
                    onChange=\{\(e\) => setShippingData\(\{\.\.\.shippingData, postalCode: e\.target\.value\}\)\}
                    placeholder="C1043"
                    required
                  />
                </div>
'@

# Nuevo código
$newCode = @'
                <div className="space-y-2">
                  <Label htmlFor="province">Provincia *</Label>
                  <Select
                    value={shippingData.province}
                    onValueChange={(value) => {
                      setShippingData({
                        ...shippingData, 
                        province: value,
                        city: "",
                        postalCode: ""
                      });
                      setShippingOptions([]);
                      setSelectedShipping(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná tu provincia" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {provinces.map((prov) => (
                        <SelectItem key={prov.code} value={prov.name}>
                          {prov.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {shippingData.province && (
                  <div className="space-y-2">
                    <Label htmlFor="city">Localidad *</Label>
                    <Select
                      value={shippingData.city}
                      onValueChange={(value) => {
                        const zipCode = getZipCodeForLocation(shippingData.province, value);
                        setShippingData({
                          ...shippingData,
                          city: value,
                          postalCode: zipCode || ""
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccioná tu localidad" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {getLocationsByProvince(shippingData.province).map((loc) => (
                          <SelectItem key={loc.name} value={loc.name}>
                            {loc.name} ({loc.zipCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {shippingData.city && (
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Código Postal *</Label>
                    <Input
                      id="postalCode"
                      value={shippingData.postalCode}
                      onChange={(e) => setShippingData({...shippingData, postalCode: e.target.value})}
                      placeholder="1234"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Si el código postal no es correcto, podés modificarlo manualmente
                    </p>
                  </div>
                )}
'@

# Reemplazar usando regex
$content = $content -replace $oldPattern, $newCode

# Guardar
Set-Content $file $content -NoNewline

Write-Host "✅ Archivo actualizado correctamente" -ForegroundColor Green
