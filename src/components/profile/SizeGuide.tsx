
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle } from 'lucide-react';

const SizeGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const womensTopsData = [
    { uk: '6', us: '2', eu: '34', bust: '30-31"' },
    { uk: '8', us: '4', eu: '36', bust: '32-33"' },
    { uk: '10', us: '6', eu: '38', bust: '34-35"' },
    { uk: '12', us: '8', eu: '40', bust: '36-37"' },
    { uk: '14', us: '10', eu: '42', bust: '38-39"' },
    { uk: '16', us: '12', eu: '44', bust: '40-41"' },
    { uk: '18', us: '14', eu: '46', bust: '42-43"' },
    { uk: '20', us: '16', eu: '48', bust: '44-45"' },
  ];

  const mensTopData = [
    { uk: 'XS', us: 'XS', eu: '44', chest: '34-36"' },
    { uk: 'S', us: 'S', eu: '46', chest: '36-38"' },
    { uk: 'M', us: 'M', eu: '48', chest: '38-40"' },
    { uk: 'L', us: 'L', eu: '50', chest: '40-42"' },
    { uk: 'XL', us: 'XL', eu: '52', chest: '42-44"' },
    { uk: 'XXL', us: 'XXL', eu: '54', chest: '44-46"' },
  ];

  const bottomsData = [
    { uk: '6', us: '2', eu: '34', waist: '24"', hip: '34"' },
    { uk: '8', us: '4', eu: '36', waist: '26"', hip: '36"' },
    { uk: '10', us: '6', eu: '38', waist: '28"', hip: '38"' },
    { uk: '12', us: '8', eu: '40', waist: '30"', hip: '40"' },
    { uk: '14', us: '10', eu: '42', waist: '32"', hip: '42"' },
    { uk: '16', us: '12', eu: '44', waist: '34"', hip: '44"' },
    { uk: '18', us: '14', eu: '46', waist: '36"', hip: '46"' },
  ];

  const shoesData = [
    { uk: '3', us: '5.5', eu: '36' },
    { uk: '4', us: '6.5', eu: '37' },
    { uk: '5', us: '7.5', eu: '38' },
    { uk: '6', us: '8.5', eu: '39' },
    { uk: '7', us: '9.5', eu: '40' },
    { uk: '8', us: '10.5', eu: '41' },
    { uk: '9', us: '11.5', eu: '42' },
    { uk: '10', us: '12.5', eu: '43' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>International Size Guide</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="womens-tops" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="womens-tops">Women's Tops</TabsTrigger>
            <TabsTrigger value="mens-tops">Men's Tops</TabsTrigger>
            <TabsTrigger value="bottoms">Bottoms</TabsTrigger>
            <TabsTrigger value="shoes">Shoes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="womens-tops">
            <Card>
              <CardHeader>
                <CardTitle>Women's Tops Size Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>UK</TableHead>
                      <TableHead>US</TableHead>
                      <TableHead>EU</TableHead>
                      <TableHead>Bust</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {womensTopsData.map((size, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{size.uk}</TableCell>
                        <TableCell>{size.us}</TableCell>
                        <TableCell>{size.eu}</TableCell>
                        <TableCell>{size.bust}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mens-tops">
            <Card>
              <CardHeader>
                <CardTitle>Men's Tops Size Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>UK</TableHead>
                      <TableHead>US</TableHead>
                      <TableHead>EU</TableHead>
                      <TableHead>Chest</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mensTopData.map((size, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{size.uk}</TableCell>
                        <TableCell>{size.us}</TableCell>
                        <TableCell>{size.eu}</TableCell>
                        <TableCell>{size.chest}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bottoms">
            <Card>
              <CardHeader>
                <CardTitle>Bottoms Size Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>UK</TableHead>
                      <TableHead>US</TableHead>
                      <TableHead>EU</TableHead>
                      <TableHead>Waist</TableHead>
                      <TableHead>Hip</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bottomsData.map((size, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{size.uk}</TableCell>
                        <TableCell>{size.us}</TableCell>
                        <TableCell>{size.eu}</TableCell>
                        <TableCell>{size.waist}</TableCell>
                        <TableCell>{size.hip}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shoes">
            <Card>
              <CardHeader>
                <CardTitle>Shoes Size Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>UK</TableHead>
                      <TableHead>US</TableHead>
                      <TableHead>EU</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shoesData.map((size, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{size.uk}</TableCell>
                        <TableCell>{size.us}</TableCell>
                        <TableCell>{size.eu}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Sizing Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Measurements are approximate and can vary between brands</li>
            <li>• Always check individual brand size charts when possible</li>
            <li>• Consider your preferred fit (tight, regular, loose) when choosing sizes</li>
            <li>• When in doubt, size up for a more comfortable fit</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeGuide;
