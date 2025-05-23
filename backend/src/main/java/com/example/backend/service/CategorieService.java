package com.example.backend.service;

import com.example.backend.entity.Categorie;
import com.example.backend.repository.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategorieService {
    
    @Autowired
    private CategorieRepository categorieRepository;
    
    public List<Categorie> findAll() {
        return categorieRepository.findAll();
    }
    
    public Categorie findById(Long id) {
        return categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée avec l'ID: " + id));
    }
    
    public Optional<Categorie> findByNom(String nom) {
        return categorieRepository.findByNom(nom);
    }
    
    @Transactional
    public Categorie create(Categorie categorie) {
        if (categorieRepository.existsByNom(categorie.getNom())) {
            throw new RuntimeException("Une catégorie avec ce nom existe déjà");
        }
        return categorieRepository.save(categorie);
    }
    
    @Transactional
    public Categorie update(Long id, Categorie categorieDetails) {
        Categorie categorie = findById(id);
        
        // Vérifier si le nouveau nom existe déjà pour une autre catégorie
        if (!categorie.getNom().equals(categorieDetails.getNom()) 
                && categorieRepository.existsByNom(categorieDetails.getNom())) {
            throw new RuntimeException("Une catégorie avec ce nom existe déjà");
        }
        
        categorie.setNom(categorieDetails.getNom());
        categorie.setDescription(categorieDetails.getDescription());
        
        return categorieRepository.save(categorie);
    }
    
    @Transactional
    public void delete(Long id) {
        Categorie categorie = findById(id);
        
        // Vérifier si la catégorie a des produits
        if (categorie.getProduits() != null && !categorie.getProduits().isEmpty()) {
            throw new RuntimeException("Impossible de supprimer cette catégorie car elle contient des produits");
        }
        
        categorieRepository.delete(categorie);
    }
}
