package com.example.backend.service;

import com.example.backend.entity.Produit;
import com.example.backend.entity.Categorie;
import com.example.backend.repository.ProduitRepository;
import com.example.backend.repository.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProduitService {
    
    @Autowired
    private ProduitRepository produitRepository;
    
    @Autowired
    private CategorieRepository categorieRepository;
    
    public List<Produit> findAll() {
        return produitRepository.findAll();
    }
    
    public List<Produit> findAllActifs() {
        return produitRepository.findByActifTrue();
    }
    
    public Produit findById(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé avec l'ID: " + id));
    }
    
    public List<Produit> findByCategorie(Long categorieId) {
        return produitRepository.findByCategorieId(categorieId);
    }
    
    public List<Produit> findByNom(String nom) {
        return produitRepository.findByNomContainingIgnoreCase(nom);
    }
    
    @Transactional
    public Produit create(Produit produit, Long categorieId) {
        if (categorieId != null) {
            Categorie categorie = categorieRepository.findById(categorieId)
                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée avec l'ID: " + categorieId));
            produit.setCategorie(categorie);
        }
        return produitRepository.save(produit);
    }
    
    @Transactional
    public Produit update(Long id, Produit produitDetails, Long categorieId) {
        Produit produit = findById(id);
        
        produit.setNom(produitDetails.getNom());
        produit.setDescription(produitDetails.getDescription());
        produit.setPrix(produitDetails.getPrix());
        produit.setStock(produitDetails.getStock());
        produit.setImageUrl(produitDetails.getImageUrl());
        produit.setActif(produitDetails.isActif());
        
        if (categorieId != null) {
            Categorie categorie = categorieRepository.findById(categorieId)
                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée avec l'ID: " + categorieId));
            produit.setCategorie(categorie);
        }
        
        return produitRepository.save(produit);
    }
    
    @Transactional
    public void delete(Long id) {
        Produit produit = findById(id);
        produitRepository.delete(produit);
    }
    
    @Transactional
    public Produit toggleActive(Long id) {
        Produit produit = findById(id);
        produit.setActif(!produit.isActif());
        return produitRepository.save(produit);
    }
    
    @Transactional
    public Produit updateStock(Long id, Integer quantite) {
        Produit produit = findById(id);
        produit.setStock(produit.getStock() + quantite);
        return produitRepository.save(produit);
    }
}
