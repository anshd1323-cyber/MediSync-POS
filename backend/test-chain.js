// Run with: node test-chain.js
// Creates one CareEpisode -> Prescription -> PrescriptionItem chain
// to verify associations and FK constraints actually work, not just load.

const {
    sequelize,
    Clinic,
    User,
    Consultation,
    Product,
    CareEpisode,
    Prescription,
    PrescriptionItem,
} = require('./src/models/index.js');

async function run() {
    const t = await sequelize.transaction();
    try {
        // 1. Find or create minimal supporting rows.
        // Adjust field names below if your Clinic/User/Product creation requires more fields.
        const clinic = await Clinic.findOne({ transaction: t });
        const doctor = await User.findOne({ where: { role: 'DOCTOR' }, transaction: t }).catch(() => null);
        const patient = await User.findOne({ where: { role: 'PATIENT' }, transaction: t }).catch(() => null);
        const product = await Product.findOne({ transaction: t });

        if (!clinic || !product) {
            throw new Error('Need at least one existing Clinic and one Product row in the DB to run this test. Create one manually first.');
        }

        // Fallback: just grab any two users if role filtering didn't find them.
        const users = await User.findAll({ limit: 2, transaction: t });
        const doctorId = (doctor || users[0])?.id;
        const patientId = (patient || users[1] || users[0])?.id;

        if (!doctorId || !patientId) {
            throw new Error('Need at least one or two User rows in the DB to run this test.');
        }

        const consultation = await Consultation.create(
            {
                patientId,
                doctorId,
                status: 'COMPLETED',
            },
            { transaction: t }
        );

        // 2. Create CareEpisode
        const careEpisode = await CareEpisode.create(
            {
                clinicId: clinic.id,
                patientId,
                doctorId,
                bookingId: consultation.id,
                consultationId: consultation.id,
                status: 'PRESCRIBED',
            },
            { transaction: t }
        );

        // 3. Create Prescription linked to CareEpisode
        const prescription = await Prescription.create(
            {
                clinicId: clinic.id,
                careEpisodeId: careEpisode.id,
                consultationId: consultation.id,
                patientId,
                doctorId,
                status: 'SIGNED',
                signedAt: new Date(),
            },
            { transaction: t }
        );

        // 4. Create PrescriptionItem linked to Prescription + real Product
        const item = await PrescriptionItem.create(
            {
                clinicId: clinic.id,
                prescriptionId: prescription.id,
                productId: product.id,
                dosage: '500mg',
                frequency: 'Twice daily',
                durationDays: 5,
                quantityPrescribed: 10,
            },
            { transaction: t }
        );

        // 5. Test FK enforcement: try creating a PrescriptionItem with a FAKE productId
        let fkRejected = false;
        try {
            await PrescriptionItem.create(
                {
                    clinicId: clinic.id,
                    prescriptionId: prescription.id,
                    productId: '00000000-0000-0000-0000-000000000000', // fake UUID
                    dosage: '1 tablet',
                    frequency: 'Once',
                    durationDays: 1,
                    quantityPrescribed: 1,
                },
                { transaction: t }
            );
        } catch (err) {
            fkRejected = true;
        }

        await t.commit();

        // 6. Verify the full chain loads back correctly via associations
        const fullChain = await CareEpisode.findByPk(careEpisode.id, {
            include: [
                {
                    model: Prescription,
                    as: 'prescription',
                    include: [{ model: PrescriptionItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
                },
            ],
        });

        console.log('\n=== RESULTS ===');
        console.log('CareEpisode created:', careEpisode.id);
        console.log('Prescription created:', prescription.id);
        console.log('PrescriptionItem created:', item.id);
        console.log('Fake productId FK correctly rejected:', fkRejected);
        console.log('\nFull chain via associations:');
        console.log(JSON.stringify(fullChain, null, 2));

        if (!fkRejected) {
            console.log('\n⚠️  WARNING: The fake productId was NOT rejected. Your FK constraints are not being enforced at the DB level (common with SQLite unless foreign_keys pragma is ON). This needs fixing before you trust data integrity.');
        } else {
            console.log('\n✅ FK enforcement working correctly.');
        }
    } catch (err) {
        await t.rollback();
        console.error('\n❌ TEST FAILED:', err.message);
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

run();