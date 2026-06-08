import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createLead } from "../actions";

export default function NieuweLeadPage() {
  return (
    <div>
      <PageHeader
        title="Nieuwe lead"
        description="Noteer wat je opvalt. Niet de functie, maar het probleem."
      />

      <Card>
        <form action={createLead} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="company">Bedrijf *</Label>
              <Input id="company" name="company" placeholder="Naam van het bedrijf" required />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" placeholder="https://..." />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="contactPerson">Contactpersoon</Label>
              <Input id="contactPerson" name="contactPerson" placeholder="Naam" />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" placeholder="naam@bedrijf.nl" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="phone">Telefoon</Label>
              <Input id="phone" name="phone" placeholder="+31 6..." />
            </div>
            <div>
              <Label htmlFor="source">Hoe gevonden</Label>
              <Input id="source" name="source" placeholder="LinkedIn, Google Maps, eigen netwerk..." />
            </div>
          </div>

          <div>
            <Label htmlFor="problemObserved">Probleem dat ik zie</Label>
            <Textarea
              id="problemObserved"
              name="problemObserved"
              placeholder="Wat valt je op aan hun situatie? Wat missen ze?"
            />
          </div>

          <div>
            <Label htmlFor="possibleSolution">Mogelijke oplossing</Label>
            <Textarea
              id="possibleSolution"
              name="possibleSolution"
              placeholder="Welke oplossing zou WebsUp hier bieden?"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="nextAction">Volgende actie</Label>
              <Input id="nextAction" name="nextAction" placeholder="Mail sturen, LinkedIn bericht..." />
            </div>
            <div>
              <Label htmlFor="nextActionAt">Wanneer</Label>
              <Input id="nextActionAt" name="nextActionAt" type="date" />
            </div>
          </div>

          <div>
            <Label htmlFor="score">Kansscore (0-100)</Label>
            <Input id="score" name="score" type="number" min={0} max={100} defaultValue={50} />
          </div>

          <div className="flex gap-2">
            <Button type="submit">Lead opslaan</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
