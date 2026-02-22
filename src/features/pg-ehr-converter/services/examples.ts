export type ExampleData = {
	label: string;
	format: string;
	data: string;
};

export const EXAMPLES: ExampleData[] = [
	{
		label: "ADT^A01 (Admit)",
		format: "HL7v2",
		data: "MSH|^~\\&|HIS|HOSPITAL|REC|FAC|20250615120000||ADT^A01|MSG001|P|2.5.1|||AL|NE\rEVN|A01|20250615120000\rPID|1||MRN-12345^^^HOSP^MR||Nguyen^Van Anh^^Ms||19850315|F|||123 Le Loi^^Ho Chi Minh^^700000^VN||0901234567||VI|S|||450-11-2345\rNK1|1|Tran^Van Binh|SPO|456 Nguyen Hue^^Ho Chi Minh^^700000^VN|0909876543\rPV1|1|I|ICU^101^A|E|||DOC-001^Tran^Dr Minh||SUR||||ADM||DOC-001^Tran^Dr Minh|IN||SELF|||||||||||||||||||HOSP||||20250615120000\rDG1|1||J18.9^Pneumonia, unspecified^I10||20250615|A\rAL1|1|DA|PCN^Penicillin|MO|Rash and hives\rIN1|1|BHXH||Vietnam Social Insurance|123 Gov St^^Hanoi||||||||||Nguyen^Van Anh|SEL||19850315|123 Le Loi^^Ho Chi Minh^^700000^VN",
	},
	{
		label: "ORU^R01 (Lab)",
		format: "HL7v2",
		data: "MSH|^~\\&|LAB|HOSPITAL|HIS|HOSPITAL|20250615140000||ORU^R01|MSG002|P|2.5.1\rPID|1||MRN-12345^^^HOSP^MR||Nguyen^Van Anh||19850315|F\rOBR|1|ORD-100|LAB-200|CBC^Complete Blood Count^LN|||20250615130000\rOBX|1|NM|WBC^White Blood Cell Count^LN||7.5|10*3/uL|4.5-11.0|N|||F\rOBX|2|NM|RBC^Red Blood Cell Count^LN||4.2|10*6/uL|3.8-5.2|N|||F\rOBX|3|NM|HGB^Hemoglobin^LN||13.5|g/dL|12.0-16.0|N|||F\rOBX|4|NM|HCT^Hematocrit^LN||40.2|%|36.0-46.0|N|||F\rOBX|5|NM|PLT^Platelet Count^LN||250|10*3/uL|150-400|N|||F",
	},
	{
		label: "VXU^V04 (Vaccination)",
		format: "HL7v2",
		data: "MSH|^~\\&|EHR|CLINIC|IIS|STATE|20250615||VXU^V04|MSG003|P|2.5.1\rPID|1||PED-001^^^CLINIC^MR||Tran^Bao||20200101|M\rRXA|0|1|20250615||141^Influenza^CVX|0.5|mL||00^New immunization||DOC-002^Le^Dr Hai|||||LOT-FLU-2025|20260101|MFG1^Sanofi\rRXA|0|1|20250601||03^MMR^CVX|0.5|mL||00^New immunization||DOC-002^Le^Dr Hai|||||LOT-MMR-2025|20260601|MFG2^Merck",
	},
	{
		label: "CDA/C-CDA",
		format: "CDA",
		data: `<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/>
  <templateId root="2.16.840.1.113883.10.20.22.1.1"/>
  <id root="2.16.840.1.113883.19.5" extension="CDA-001"/>
  <code code="34133-9" displayName="Summarization of Episode Note" codeSystem="2.16.840.1.113883.6.1"/>
  <effectiveTime value="20250615"/>
  <recordTarget>
    <patientRole>
      <id root="2.16.840.1.113883.19.5" extension="PAT-001"/>
      <addr><streetAddressLine>123 Main St</streetAddressLine><city>Springfield</city><state>IL</state><postalCode>62704</postalCode></addr>
      <telecom use="HP" value="tel:555-0100"/>
      <patient>
        <name><given>John</given><family>Smith</family></name>
        <administrativeGenderCode code="M" displayName="Male" codeSystem="2.16.840.1.113883.5.1"/>
        <birthTime value="19800101"/>
      </patient>
    </patientRole>
  </recordTarget>
  <component>
    <structuredBody>
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.5.1"/>
          <code code="11450-4" codeSystem="2.16.840.1.113883.6.1" displayName="Problem List"/>
          <title>Problems</title>
          <entry>
            <act classCode="ACT" moodCode="EVN">
              <templateId root="2.16.840.1.113883.10.20.22.4.3"/>
              <entryRelationship typeCode="SUBJ">
                <observation classCode="OBS" moodCode="EVN">
                  <templateId root="2.16.840.1.113883.10.20.22.4.4"/>
                  <code code="64572001" codeSystem="2.16.840.1.113883.6.96" displayName="Condition"/>
                  <statusCode code="active"/>
                  <value xsi:type="CD" code="E11.9" codeSystem="2.16.840.1.113883.6.90" displayName="Type 2 diabetes mellitus without complications"/>
                </observation>
              </entryRelationship>
            </act>
          </entry>
          <entry>
            <act classCode="ACT" moodCode="EVN">
              <templateId root="2.16.840.1.113883.10.20.22.4.3"/>
              <entryRelationship typeCode="SUBJ">
                <observation classCode="OBS" moodCode="EVN">
                  <templateId root="2.16.840.1.113883.10.20.22.4.4"/>
                  <code code="64572001" codeSystem="2.16.840.1.113883.6.96" displayName="Condition"/>
                  <statusCode code="active"/>
                  <value xsi:type="CD" code="I10" codeSystem="2.16.840.1.113883.6.90" displayName="Essential hypertension"/>
                </observation>
              </entryRelationship>
            </act>
          </entry>
        </section>
      </component>
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.6.1"/>
          <code code="48765-2" codeSystem="2.16.840.1.113883.6.1" displayName="Allergies"/>
          <title>Allergies</title>
          <entry>
            <act classCode="ACT" moodCode="EVN">
              <templateId root="2.16.840.1.113883.10.20.22.4.30"/>
              <entryRelationship typeCode="SUBJ">
                <observation classCode="OBS" moodCode="EVN">
                  <templateId root="2.16.840.1.113883.10.20.22.4.7"/>
                  <code code="ASSERTION" codeSystem="2.16.840.1.113883.5.4"/>
                  <statusCode code="completed"/>
                  <participant typeCode="CSM">
                    <participantRole classCode="MANU">
                      <playingEntity classCode="MMAT">
                        <code code="70618" codeSystem="2.16.840.1.113883.6.88" displayName="Penicillin"/>
                      </playingEntity>
                    </participantRole>
                  </participant>
                </observation>
              </entryRelationship>
            </act>
          </entry>
        </section>
      </component>
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.1.1"/>
          <code code="10160-0" codeSystem="2.16.840.1.113883.6.1" displayName="Medications"/>
          <title>Medications</title>
          <entry>
            <substanceAdministration classCode="SBADM" moodCode="EVN">
              <templateId root="2.16.840.1.113883.10.20.22.4.16"/>
              <statusCode code="active"/>
              <effectiveTime value="20250101"/>
              <doseQuantity value="500" unit="mg"/>
              <consumable>
                <manufacturedProduct>
                  <templateId root="2.16.840.1.113883.10.20.22.4.23"/>
                  <manufacturedMaterial>
                    <code code="860975" codeSystem="2.16.840.1.113883.6.88" displayName="Metformin 500 MG"/>
                  </manufacturedMaterial>
                </manufacturedProduct>
              </consumable>
            </substanceAdministration>
          </entry>
        </section>
      </component>
    </structuredBody>
  </component>
</ClinicalDocument>`,
	},
	{
		label: "ADT + Z-segments",
		format: "HL7v2",
		data: "MSH|^~\\&|HIS|HOSPITAL|REC|FAC|20250615120000||ADT^A01|MSG004|P|2.5.1\rPID|1||MRN-99999^^^HOSP^MR||Le^Thi Mai||19780220|F\rPV1|1|I|MED^201^B|U|||DOC-005^Pham^Dr Duc\rZBH|1|DN0112345678|01|BH20250101|BH20251231|100|Hanoi BHXH\rZCC|1|J18.9|Pneumonia|20250615|A\rZPV|1|KCB|201|NORMAL|20250615120000|20250620120000\rZCU|1|CUSTOM_FIELD_1|Value for custom field|Additional data|Extra info",
	},
	{
		label: "FHIR R4 Bundle",
		format: "FHIR",
		data: JSON.stringify(
			{
				resourceType: "Bundle",
				type: "transaction",
				entry: [
					{
						resource: {
							resourceType: "Patient",
							id: "pat-001",
							identifier: [{ system: "MRN", value: "12345" }],
							name: [{ family: "Doe", given: ["Jane"] }],
							gender: "female",
							birthDate: "1990-05-15",
						},
					},
					{
						resource: {
							resourceType: "Encounter",
							id: "enc-001",
							status: "in-progress",
							class: { code: "IMP", display: "inpatient" },
							subject: { reference: "Patient/pat-001" },
						},
					},
					{
						resource: {
							resourceType: "Observation",
							id: "obs-bp",
							status: "final",
							subject: { reference: "Patient/pat-001" },
							code: {
								coding: [
									{
										system: "http://loinc.org",
										code: "85354-9",
										display: "Blood pressure panel",
									},
								],
							},
							component: [
								{
									code: {
										coding: [
											{
												system: "http://loinc.org",
												code: "8480-6",
												display: "Systolic BP",
											},
										],
									},
									valueQuantity: { value: 140, unit: "mmHg" },
								},
								{
									code: {
										coding: [
											{
												system: "http://loinc.org",
												code: "8462-4",
												display: "Diastolic BP",
											},
										],
									},
									valueQuantity: { value: 90, unit: "mmHg" },
								},
							],
						},
					},
					{
						resource: {
							resourceType: "Condition",
							id: "cond-001",
							subject: { reference: "Patient/pat-001" },
							code: {
								coding: [
									{
										system: "http://hl7.org/fhir/sid/icd-10",
										code: "I10",
										display: "Essential hypertension",
									},
								],
							},
							clinicalStatus: {
								coding: [
									{
										system:
											"http://terminology.hl7.org/CodeSystem/condition-clinical",
										code: "active",
									},
								],
							},
						},
					},
					{
						resource: {
							resourceType: "AllergyIntolerance",
							id: "allergy-001",
							patient: { reference: "Patient/pat-001" },
							code: {
								coding: [
									{
										system: "http://www.nlm.nih.gov/research/umls/rxnorm",
										code: "70618",
										display: "Penicillin",
									},
								],
							},
							type: "allergy",
							category: ["medication"],
						},
					},
				],
			},
			null,
			2
		),
	},
];
