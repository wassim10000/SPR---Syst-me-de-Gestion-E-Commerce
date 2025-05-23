package com.example.backend.config;

import com.example.backend.entity.Categorie;
import com.example.backend.entity.Produit;
import com.example.backend.repository.CategorieRepository;
import com.example.backend.repository.ProduitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@Order(2) // S'exécute après ECommerceInitializer
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategorieRepository categorieRepository;

    @Autowired
    private ProduitRepository produitRepository;
    

    
    private final Random random = new Random();

    @Override
    @Transactional
    public void run(String... args) {
        // Ne pas initialiser si des produits existent déjà
        if (produitRepository.count() > 0) {
            System.out.println("Des produits existent déjà, pas d'initialisation de données nécessaire.");
            return;
        }
        
        // Initialiser les catégories
        List<Categorie> categories = createCategories();
        
        // Initialiser les produits
        createProducts(categories);
        
        System.out.println("Initialisation des données terminée !");
    }

    private List<Categorie> createCategories() {
        List<Categorie> categories = new ArrayList<>();
        
        // Définir les catégories principales
        String[] categoriesNoms = {
            "Électronique", "Vêtements", "Maison & Cuisine", "Livres", "Sports & Loisirs",
            "Beauté & Santé", "Jouets & Jeux", "Outils & Bricolage"
        };
        
        String[] categoriesDescriptions = {
            "Tous les produits électroniques et gadgets",
            "Vêtements pour hommes, femmes et enfants",
            "Tout pour la maison et la cuisine",
            "Livres, e-books et publications",
            "Équipements sportifs et activités de loisirs",
            "Produits de beauté et de santé",
            "Jouets pour enfants et jeux pour tous âges",
            "Outils et matériel de bricolage"
        };
        
        for (int i = 0; i < categoriesNoms.length; i++) {
            Categorie categorie = new Categorie();
            categorie.setNom(categoriesNoms[i]);
            categorie.setDescription(categoriesDescriptions[i]);
            categories.add(categorieRepository.save(categorie));
        }
        
        return categories;
    }
    
    private void createProducts(List<Categorie> categories) {
        // Noms et descriptions fictifs des produits par catégorie
        
        // Électronique
        createProductsForCategory(categories.get(0), new String[] {
            "Smartphone Ultra HD", "Ordinateur Portable 15\"", "Écouteurs sans fil", "Tablette 10 pouces",
            "Télévision Smart 4K 55\"", "Appareil photo reflex", "Enceinte Bluetooth", "Montre connectée",
            "Console de jeux", "Casque de réalité virtuelle"
        }, new String[] {
            "Smartphone dernière génération avec écran Ultra HD et appareil photo 48MP",
            "Ordinateur portable léger et puissant pour tous vos besoins",
            "Écouteurs sans fil avec réduction de bruit active et autonomie exceptionnelle",
            "Tablette tactile haute performance avec écran 10 pouces",
            "Télévision Smart 4K avec assistant vocal intégré et applications streaming",
            "Appareil photo reflex professionnel pour des photos de qualité",
            "Enceinte Bluetooth portable avec son stéréo et basses profondes",
            "Montre connectée avec suivi d'activité et notifications",
            "Console de jeux dernière génération avec graphismes époustouflants",
            "Casque de réalité virtuelle immersif pour une expérience de jeu unique"
        }, new BigDecimal[] {
            new BigDecimal("899.99"), new BigDecimal("1299.99"), new BigDecimal("149.99"),
            new BigDecimal("399.99"), new BigDecimal("799.99"), new BigDecimal("649.99"),
            new BigDecimal("89.99"), new BigDecimal("199.99"), new BigDecimal("499.99"),
            new BigDecimal("349.99")
        });
        
        // Vêtements
        createProductsForCategory(categories.get(1), new String[] {
            "T-shirt en coton bio", "Jean slim stretch", "Robe d'été fleurie", "Chemise habillée",
            "Veste légère", "Pull en laine mérinos", "Costume deux pièces", "Manteau d'hiver",
            "Chaussures de sport", "Chaussures en cuir"
        }, new String[] {
            "T-shirt confortable en coton bio, idéal pour tous les jours",
            "Jean slim avec matière stretch pour un confort optimal",
            "Robe légère à motifs fleuris parfaite pour l'été",
            "Chemise habillée en coton de qualité supérieure",
            "Veste légère et imperméable pour les journées fraîches",
            "Pull en laine mérinos chaude et douce pour l'hiver",
            "Costume deux pièces élégant pour les occasions spéciales",
            "Manteau d'hiver chaud et confortable avec capuche",
            "Chaussures de sport légères et respirantes",
            "Chaussures en cuir véritable, élégantes et durables"
        }, new BigDecimal[] {
            new BigDecimal("24.99"), new BigDecimal("59.99"), new BigDecimal("49.99"),
            new BigDecimal("69.99"), new BigDecimal("89.99"), new BigDecimal("79.99"),
            new BigDecimal("199.99"), new BigDecimal("149.99"), new BigDecimal("89.99"),
            new BigDecimal("129.99")
        });
        
        // Maison & Cuisine
        createProductsForCategory(categories.get(2), new String[] {
            "Robot de cuisine multifonction", "Ensemble de casseroles", "Service de table 12 pièces",
            "Cafetière programmable", "Aspirateur robot", "Mixeur plongeant", "Ensemble de couteaux",
            "Machine à pain", "Grille-pain 4 tranches", "Ensemble de draps en coton"
        }, new String[] {
            "Robot de cuisine multifonction pour faciliter vos préparations culinaires",
            "Ensemble de casseroles en acier inoxydable pour une cuisine saine",
            "Service de table élégant en porcelaine, 12 pièces",
            "Cafetière programmable avec broyeur à grains intégré",
            "Aspirateur robot intelligent avec cartographie et contrôle via application",
            "Mixeur plongeant puissant avec plusieurs accessoires",
            "Ensemble de couteaux professionnels en acier inoxydable",
            "Machine à pain automatique avec programmes variés",
            "Grille-pain 4 tranches avec réglage de brunissage",
            "Ensemble de draps en coton égyptien, doux et résistants"
        }, new BigDecimal[] {
            new BigDecimal("299.99"), new BigDecimal("149.99"), new BigDecimal("89.99"),
            new BigDecimal("129.99"), new BigDecimal("249.99"), new BigDecimal("49.99"),
            new BigDecimal("129.99"), new BigDecimal("99.99"), new BigDecimal("59.99"),
            new BigDecimal("79.99")
        });
        
        // Livres
        createProductsForCategory(categories.get(3), new String[] {
            "Roman d'aventure", "Manuel de développement personnel", "Livre de cuisine",
            "Bande dessinée collector", "Roman historique", "Dictionnaire illustré",
            "Livre pour enfants", "Biographie inspirante", "Guide de voyage", "Roman policier"
        }, new String[] {
            "Roman d'aventure captivant qui vous transportera dans un monde fantastique",
            "Manuel pratique pour développer votre potentiel et atteindre vos objectifs",
            "Livre de cuisine avec des recettes du monde entier, faciles à réaliser",
            "Édition collector d'une bande dessinée culte avec illustrations inédites",
            "Roman historique basé sur des faits réels qui ont marqué notre histoire",
            "Dictionnaire illustré complet avec définitions claires et exemples",
            "Livre pour enfants coloré et éducatif avec histoires captivantes",
            "Biographie inspirante d'une personnalité qui a changé le monde",
            "Guide de voyage complet avec conseils, cartes et bonnes adresses",
            "Roman policier haletant avec une enquête complexe et des rebondissements"
        }, new BigDecimal[] {
            new BigDecimal("19.99"), new BigDecimal("24.99"), new BigDecimal("29.99"),
            new BigDecimal("39.99"), new BigDecimal("22.99"), new BigDecimal("49.99"),
            new BigDecimal("14.99"), new BigDecimal("26.99"), new BigDecimal("21.99"),
            new BigDecimal("18.99")
        });
        
        // Sports & Loisirs
        createProductsForCategory(categories.get(4), new String[] {
            "Vélo de montagne", "Raquette de tennis", "Sac de golf", "Tapis de yoga",
            "Haltères ajustables", "Canne à pêche", "Tente de camping", "Ballon de football",
            "Planche de surf", "Kayak gonflable"
        }, new String[] {
            "Vélo de montagne tout-terrain avec suspension et freins à disque",
            "Raquette de tennis professionnelle avec grip confortable",
            "Sac de golf complet avec compartiments pour tous vos clubs",
            "Tapis de yoga antidérapant et écologique pour vos séances de méditation",
            "Haltères ajustables de 2 à 20kg pour vos entraînements à domicile",
            "Canne à pêche télescopique en carbone ultra-légère",
            "Tente de camping imperméable et facile à monter pour 4 personnes",
            "Ballon de football officiel, cousu main pour une meilleure durabilité",
            "Planche de surf pour débutants et intermédiaires avec design moderne",
            "Kayak gonflable 2 places, facile à transporter et à ranger"
        }, new BigDecimal[] {
            new BigDecimal("699.99"), new BigDecimal("129.99"), new BigDecimal("199.99"),
            new BigDecimal("39.99"), new BigDecimal("149.99"), new BigDecimal("79.99"),
            new BigDecimal("199.99"), new BigDecimal("29.99"), new BigDecimal("349.99"),
            new BigDecimal("299.99")
        });
        
        // Les autres catégories...
        
        // Beauté & Santé
        createProductsForCategory(categories.get(5), new String[] {
            "Coffret de soins visage", "Sèche-cheveux professionnel", "Parfum de luxe",
            "Brosse à dents électrique", "Crème hydratante", "Huiles essentielles",
            "Lisseur céramique", "Coffret maquillage", "Masseur électrique", "Crème solaire"
        }, new String[] {
            "Coffret complet de soins visage avec produits naturels et biologiques",
            "Sèche-cheveux professionnel avec technologie ionique pour des cheveux brillants",
            "Parfum de luxe aux notes florales et boisées, longue tenue",
            "Brosse à dents électrique rechargeable avec plusieurs modes de brossage",
            "Crème hydratante pour tous types de peau, formule enrichie en vitamines",
            "Coffret d'huiles essentielles 100% pures et naturelles pour aromathérapie",
            "Lisseur céramique professionnel avec réglage de température",
            "Coffret maquillage complet avec palette de fards à paupières, rouges à lèvres et plus",
            "Masseur électrique pour soulager les tensions musculaires et le stress",
            "Crème solaire haute protection, résistante à l'eau et non grasse"
        }, new BigDecimal[] {
            new BigDecimal("69.99"), new BigDecimal("89.99"), new BigDecimal("79.99"),
            new BigDecimal("99.99"), new BigDecimal("29.99"), new BigDecimal("39.99"),
            new BigDecimal("59.99"), new BigDecimal("49.99"), new BigDecimal("69.99"),
            new BigDecimal("19.99")
        });
    }
    
    private void createProductsForCategory(Categorie categorie, String[] noms, String[] descriptions, BigDecimal[] prix) {
        for (int i = 0; i < noms.length; i++) {
            Produit produit = new Produit();
            produit.setNom(noms[i]);
            produit.setDescription(descriptions[i]);
            produit.setPrix(prix[i]);
            produit.setStock(10 + random.nextInt(90)); // Stock entre 10 et 99
            
            // Images via Picsum Photos (service d'images aléatoires)
            int imageId = 100 + i + (categorie.getId().intValue() * 10);
            produit.setImageUrl("https://picsum.photos/id/" + imageId + "/800/600");
            
            produit.setCategorie(categorie);
            produit.setActif(true);
            
            produitRepository.save(produit);
        }
    }
}
